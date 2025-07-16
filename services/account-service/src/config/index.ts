interface Config{
   SERVICE_NAME: string;
   PORT: number;
   LOG_LEVEL: string;
   DATABASE_URL: string;
   JWT_SECRET: string;
   JWT_EXPIRES_IN: string;
   REDIS_URL: string;
   KAFKA_BROKER: string;
   ALLOWED_ORIGINS: string;
}

export const config:Config ={
    SERVICE_NAME:require('../../package.json').name,
    PORT:Number(process.env.PORT) || 3001,
    JWT_SECRET:process.env.JWT_SECRET || "randomSecretKeyItIsHerefellaswotuCooking",
    JWT_EXPIRES_IN:process.env.JWT_EXPIRES_IN || "1h",
    LOG_LEVEL:process.env.LOG_LEVEL || "debug",
    DATABASE_URL:process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/auth-service",
    REDIS_URL:process.env.REDIS_URL || "redis://localhost:6379",
    KAFKA_BROKER:process.env.KAFKA_BROKER || "localhost:9092",
    ALLOWED_ORIGINS:process.env.ALLOWED_ORIGINS || "http://localhost:3000"
}

