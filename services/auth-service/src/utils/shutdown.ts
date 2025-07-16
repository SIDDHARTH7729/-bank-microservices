import {Server} from "http";
import {AppDataSource} from "../data-source";
import logger from "../config/logger";
import { redisClient } from "../config/redis";
import { disConnectKafka } from "../events/kafka";

export const GraceFulShutdown = (server:Server) =>{
    const shutdown = async(signal:string)=>{
        logger.info(`Received ${signal} shutting down the server`)

        try {
            await new Promise<void>((resolve)=>{
                server.close(()=>{
                    logger.info("Http server closed");
                    resolve();
                })
            })

            if(AppDataSource.isInitialized){
                await AppDataSource.destroy();
                logger.info("Database connection closed");
            }

            await redisClient.closeConnection()

            await disConnectKafka();

            logger.info(`Graceful shutdown complete`);
            process.exit(0);

        } catch (error) {
            logger.error("Failed to shutdown the server", error);
            process.exit(1);
        }
    }

    process.on('SIGTERM',()=>shutdown('SIGTERM'));
    process.on('SIGINT',()=>shutdown('SIGINT'));

    process.on('uncaughtException',error=>{
        logger.error("Uncaught exception", error);
        process.exit(1);
    })

    process.on('unhandledRejection',error=>{
        logger.error("Unhandled promise rejection", error);
        process.exit(1);
    })
}