import dotenv from "dotenv";
dotenv.config();

import express from 'express'
import { verifyToken } from "./middlewares/auth.middlewares";
import logger from "./config/logger";
import { reqLogger } from "./middlewares/req.middlewares";
import { AppDataSource } from "./data-source";
import { config } from "./config";
import indexRouter from "./routes/index.routes";
import accountRouter from "./routes/account.routes";
import { errorHandler } from "./middlewares/error.middlewares";
import init from "./init";


const app = express();
app.use(reqLogger)
app.use(express.json())
app.use(verifyToken)

app.use("/",indexRouter)
app.use('/api/v1/accounts',accountRouter)

app.use(errorHandler)

AppDataSource.initialize()
.then(async ()=>{
    await init();

    app.listen(config.PORT,()=>{
        logger.info(`${config.SERVICE_NAME} is running on port ${config.PORT}`);
    })
}).catch((err)=>{
    logger.error("Failed to start server", err);
    process.exit(1);
})