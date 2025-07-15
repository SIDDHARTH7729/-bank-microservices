import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import { z } from "zod";
import { Customerror } from "../types";

export const errorhandler = (error: Customerror, req: Request, res: Response, next: NextFunction) => {
    logger.error(error)
    if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0].message })


    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    const status = error.status || "error";

    if(process.env.NODE_ENV !== 'production'){
        logger.error({
            message,
            stack:error.stack,
            path:req.path,
            method:req.method,
            status:status,
            statusCode:statusCode,
            timestamp:new Date().toISOString(),
            query:req.query,
            body:req.body
        })
    }

    res.status(statusCode).json({ status,message });

}