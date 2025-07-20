import { startConsumers } from "../events/consumers";
import { connectKafka } from "../events/kafka";
import logger from "../config/logger";
import  {config} from "../config";

export default async () => {
    try {
        await connectKafka();
        await startConsumers();
        logger.info(`Service ${config.SERVICE_NAME} started successfully`);
    } catch (error) {
        logger.error(`Failed to start service ${config.SERVICE_NAME}`, error);
        throw error;
    }
};