import { config } from "../../config";
import logger from "../../config/logger";
import { startTransactionEventsConsumer } from "./transactionEventConsumer";

export const startConsumers = async():Promise<void> =>{
   try {
    logger.info(`Starting kafka consumers for ${config.SERVICE_NAME}`)

    await startTransactionEventsConsumer();

    logger.info(
        `All kafka consumers started successfully for ${config.SERVICE_NAME}`
    )
   } catch (error:any) {
       logger.error("Failed to start kafka consumers", error);
       throw error;
   }
}