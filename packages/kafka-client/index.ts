import {Kafka,Producer,Partitioners} from "kafkajs";
import { getLogger } from "@bank/logger";

const logger = getLogger("@bank/KafkaClient", "info");


class KafkaClient{
    private producer:Producer;
    private isConnected = false;
    private readonly kafka:Kafka;

    constructor(
        clientId:string,
        brokers:string[],
        options = {
            allowAutoTopicCreation: true,
            createPartitioner: Partitioners.DefaultPartitioner,
        }
    ){
        this.kafka = new Kafka({
            clientId,
            brokers,
        });
        this.producer = this.kafka.producer(options);
        this.SetUpEventListeners();
    }

    private SetUpEventListeners(){
        this.producer.on('producer.connect',()=>{
            this.isConnected = true;
            logger.info("Producer connected");
        })
        this.producer.on('producer.disconnect',()=>{
            this.isConnected = false;
            logger.info("Producer disconnected");
        })
        this.producer.on('producer.network.request_timeout',(payload)=>{
            logger.info("Producer network request timeout", payload);
        })
    }

    public getProducer():Producer{
        return this.producer;
    }

    public createConsumer(groupID:string){
        return this.kafka.consumer({groupId:groupID});
    }

    public async connect():Promise<void>{
        try {
            await this.producer.connect();
        } catch (error) {
            logger.error("Failed to connect producer", error);
        }
    }

    public async disConnect():Promise<void>{
        try {
            await this.producer.disconnect();
            this.isConnected=false;
        } catch (error) {
            logger.error("Failed to disconnect producer", error);
        }
    }
}

export default KafkaClient;

export interface KafkaMessage<T>{
    key:string;
    value:T
}

export abstract class BaseProducer<T>{
    protected abstract readonly topic:string;
    private producer:Producer;

    constructor(producer:Producer){
        this.producer = producer;
    }

    async publish(data:KafkaMessage<T>):Promise<void>{
        try {
            logger.info(
                `publishing message to topcic ${this.topic} with key ${data.key} and value ${JSON.stringify(data.value)}`
            )
            await this.producer.send({
                topic: this.topic,
                messages: [
                    {
                        key: data.key,
                        value: JSON.stringify(data.value),
                    },
                ],
            });

            logger.debug("Message published successfully to the topic : ", this.topic);
        } catch (error) {
            logger.error("Failed to publish message", error);
        }
    }
}