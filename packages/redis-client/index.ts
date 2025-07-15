import Redis from "ioredis";
import { getLogger } from "@bank/logger";

const logger = getLogger("@bank/RedisClient", "info");

class RedisClient {
    private instance: Redis;
    private isConnected = false;
    private REDIS_URL: string;
    private options: Record<string, unknown>;

    constructor(REDIS_URL: string, options: Record<string, unknown> = {}) {
        this.REDIS_URL = REDIS_URL;
        this.options = options || {
            retryStrategy: (times: number) => {
                return Math.min(times * 100, 2000);
            },
            maxRetriesPerRequest: 4,
        }

        this.instance = new Redis(this.REDIS_URL, this.options);
        this.setUpEventListeners();
    }

    public getInstance(): Redis {
        return this.instance;
    }

    private setUpEventListeners(): void {
        this.instance.on('connect', () => {
            this.isConnected = true;
            logger.info("Redis connected");
        })
        this.instance.on('disconnect', () => {
            this.isConnected = false;
            logger.info("Redis disconnected");
        })
        this.instance.on('error', (error) => {
            this.isConnected = false;
            logger.error("Redis error", error);
        })
        this.instance.on('reconnecting', () => {
            this.isConnected = false;
            logger.error("Redis reconnecting",);
        })
    }

    public isReady(): boolean {
        return this.isConnected;
    }

    public async closeConnection() {
        if (this.instance) {
            try {
                await this.instance.quit();
                logger.info("Redis connection closed");
            } catch (error) {
                logger.error("Failed to close Redis connection", error);
            }
        }
    }
}

export default RedisClient;