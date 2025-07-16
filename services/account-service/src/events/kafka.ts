import KafkaClient from "@bank/kafka-client";
import { config } from "../config";
import logger from "../config/logger";

export const kafkaClient = new KafkaClient(config.SERVICE_NAME,[config.KAFKA_BROKER]);

export const producer = kafkaClient.getProducer();

export const connectKafka = async() =>{
    try {
     await kafkaClient.connect();
     logger.info("Connected to kafka producer/consumer");
    } catch (error) {
     logger.error("Failed to connect kafka producer/consumer", error);
     throw error
    }
}

export const disConnectKafka = async () =>{
    try {
       await kafkaClient.disConnect();
       logger.info("Kafka producer disconnected")
    } catch (error) {
        logger.error("Failed to disconnect kafka producer/consumer")
    }
}