import { TRANSACTION_TOPICS } from "@bank/constants";
import { BaseProducer } from "@bank/kafka-client";
import { producer } from "../kafka";

export interface TransactionEVentProducer{
    eventType:string;
    transactionId:string;
    timestamp?:number;
}

class TransactionEventProducer extends BaseProducer<TransactionEVentProducer>{
    protected readonly topic = TRANSACTION_TOPICS.TRANSACTION_EVENTS;
    constructor(){super(producer)}
}

const transactionEventsProducer = new TransactionEventProducer();

export const publishTransactionEventToKafka = async<T extends TransactionEVentProducer>(eventData:T):Promise<void> =>{
    return transactionEventsProducer.publish({
        key:eventData.transactionId,
        value:{
            ...eventData,
            timeStamp:Date.now()
        }
    })
}