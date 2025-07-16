import dotenv from "dotenv";
dotenv.config();

import express from 'express'
import helmet from "helmet";
import { verifytOken } from "./middlewares/auth.middleware";
import { errorhandler } from "./middlewares/error.middlewares";
import { corsMiddleware } from "./middlewares/cors.middlewares";
import logger from "./config/logger";
import { reqLogger } from "./middlewares/req.middlewares";
import { AppDataSource } from "./data-source";
import { config } from "./config";
import { authRouter,indexRouter } from "./routes";
import init from "./init";
import { GraceFulShutdown } from "./utils/shutdown";

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());

app.use(reqLogger)
app.use(verifytOken)
app.use("/",indexRouter)
app.use("/api/v1/auth",authRouter)

app.use(errorhandler)

AppDataSource.initialize().then(async () => {
    await init()
    const server = app.listen(config.PORT, () => {
        logger.info(`${config.SERVICE_NAME} is running on port ${config.PORT}`);
    });
    GraceFulShutdown(server);
}).catch((error)=>{
    logger.error(`Some error occured during Data Source Initialisation ${error}`);
})