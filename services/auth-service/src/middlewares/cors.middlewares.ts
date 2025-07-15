import cors from "cors";
import { config } from "../config";

export const corsMiddleware = cors({
    origin: config.ALLOWED_ORIGINS.split(','),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept","Access-Control-Allow-Origin",
        "Authorization",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Credentials"],
})