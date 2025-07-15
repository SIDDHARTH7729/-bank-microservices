import RedisClient from "@bank/redis-client";
import { config } from "./index";

export const redisClient = new RedisClient(config.REDIS_URL);

export default redisClient.getInstance();