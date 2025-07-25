import dotenv from "dotenv";
dotenv.config();

import express,{NextFunction,Request,Response} from "express";
import { config } from "./config";
import helmet from "helmet";
import cors from "cors";

import {limiter} from "./middlewares/rate-limiter.middlewares";
import logger from "./config/logger";
import { proxyServices } from "./config/service";

const app = express();

app.use(helmet());
app.use(cors());
app.use(limiter)

app.use((req:Request,res:Response,next:NextFunction) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.get('/health', (req:Request, res:Response) => {
   res.status(200).json({status:"Server is up and Running"});
});

proxyServices(app);

app.use((req:Request,res:Response)=>{
   logger.warn(`Resource not found: ${req.method} ${req.url}`);
   res.status(404).json({error:"Resource not found"});
})

app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
   logger.error(`Unhandled error: `,err)
   res.status(500).json({error:err.message});
})

const startServer = () =>{
    try {
        app.listen(config.PORT,()=>{
            logger.info(`${config.SERVICE_NAME} is running on port ${config.PORT}`);
        })
    } catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
}

startServer();