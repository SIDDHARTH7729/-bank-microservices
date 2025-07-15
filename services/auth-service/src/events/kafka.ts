import KafkaClient from "@bank/kafka-client";
import {config} from "../config";
import logger from "../config/logger";

const kafkaCLient = new KafkaClient(config.SERVICE_NAME,[config.KAFKA_BROKER]);

export const producer = kafkaCLient.getProducer();

export const connectKafka = async() =>{
   try {
    await kafkaCLient.connect();
    logger.info("Connected to kafka producer/consumer");
   } catch (error) {
    logger.error("Failed to connect kafka producer/consumer", error);
    throw error
   }
}