import { Request,Response,NextFunction } from "express";
import redis from "../config/redis";
import jwt from "jsonwebtoken";
import { config } from "../config";

const publicRoutes = [
    '/',
    '/health'
]

export const verifyToken = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
    if (publicRoutes.includes(req.path)) return next();

    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    jwt.verify(token, config.JWT_SECRET, async (err: any, decoded: any) => {
        if (err || !decoded?.id) {
            return res.status(403).json({ message: "Invalid auth token" });
        }

        const redisKey = `auth:${decoded.id}:${token}`;
        const redisToken = await redis.get(redisKey);

        if (!redisToken) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        req.userId = decoded.id;
        req.token = token;
        next();
    });
}
