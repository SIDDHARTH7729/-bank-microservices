import { NextFunction,Request,Response } from "express";
import logger from "../config/logger";

export const reqLogger = (req:Request,res:Response,next:NextFunction) => {
    logger.debug(`Request for ${req.method} ${req.url}`);
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Response for ${req.method} ${req.url} took ${duration}ms`);
    });

    next();
}