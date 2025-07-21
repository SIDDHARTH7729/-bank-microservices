import dotenv from "dotenv";
dotenv.config();

export const Config ={
    apiGatewayUrl:process.env.API_GATEWAY_URL||"http://localhost:3000",
    authUrl:process.env.AUTH_SERVICE_URL||"http://localhost:3001",
    accountUrl:process.env.ACCOUNT_SERVICE_URL||"http://localhost:3002",
}