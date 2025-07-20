import { USER_TOPICS } from "@bank/constants";
import { BaseProducer,KafkaMessage } from "@bank/kafka-client";
import { producer } from "../kafka";

export interface AccountDeletedData{
    id:number;
}

class AccountDeletedProducer extends BaseProducer<AccountDeletedData>{
    protected readonly topic = USER_TOPICS.ACCOUNT_DELETED
    constructor(){super(producer)}
}

const accountDeletedProducer = new AccountDeletedProducer()

export const publishAccountDeletedTokafka = async(data:KafkaMessage<AccountDeletedData>):Promise<void> =>{
    accountDeletedProducer.publish(data);
}