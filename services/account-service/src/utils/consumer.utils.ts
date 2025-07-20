import { ERROR_CODES } from "@bank/constants";
import redis from "../config/redis";

const getEventKey = (transactionId:string,eventType:string):string=>{
    return `transaction:${transactionId}:${eventType}`;
} 

const DEFAULT_TTL_SECONDS = 60*60. // hence 1 hour

export async function hasEventBeenProcessed(tarnsactionId:string,eventType:string):Promise<boolean>{
    const key = getEventKey(tarnsactionId,eventType)
    const result = await redis.exists(key)
    return result === 1;
}

export async function markEventAsProcessed(tarnsactionId:string,eventType:string,ttlSeconds=DEFAULT_TTL_SECONDS):Promise<void>{
    const key = getEventKey(tarnsactionId,eventType)
    await redis.set(key,"1","EX",ttlSeconds);
}
