import { Request, Response, Router } from "express";
import { config } from "../config";

const indexRouter = Router();

indexRouter.get('/',async (req:Request, res:Response):Promise<any> => {
    return res.status(200).json({service:config.SERVICE_NAME,status:"Server is up and Running"})
})

indexRouter.get('/health',async (req:Request, res:Response):Promise<any> => {
    return res.status(200).json({service:config.SERVICE_NAME,status:"Server is up and Running"})
})

export default indexRouter