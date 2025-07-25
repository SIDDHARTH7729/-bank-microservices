import {Request,Response,NextFunction} from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import redis from "../config/redis";

const publicRoutes = [
    '/',
    '/health',
    "/api/v1/auth/login",
    "/api/v1/auth/register"
]

export const verifytOken = (req:Request,res:Response,next:NextFunction) => {
    if(publicRoutes.includes(req.path)) return next();
    const token = req.headers['authorization']?.split(' ')[1];

    if(!token){
        return res.status(403).json({message:"Invalid auth token"});
    }

    jwt.verify(token,config.JWT_SECRET,(err:any,decoded:any) => {
        if(err){
            return res.status(403).json({message:"Invalid auth token"});
        }

        const redisKey = `auth-${decoded.id}:${token}`;
        const redisToken = redis.get(redisKey);

        if(!redisToken){
            return res.status(403).json({message:"Invalid auth token"});
        }
        
        req.userId = decoded.id;
        req.token = token;
        next();
    })
}