import { Application } from "express";
import {createProxyMiddleware,Options} from "http-proxy-middleware";
import { config } from "./index";
import  logger  from "./logger";
import { ProxyErrorResponse,ServiceConfig } from "../types";

class ProxyService{
    private static readonly serviceConfigd:ServiceConfig[] = [
        {
            path:`/api/v1/auth/`,
            url:config.AUTH_SERVICE_URL,
            pathRewrite:{"^/":"/api/v1/auth/"},
            name:"auth-service",
            timeout:5000,
        },
        {
            path:`/api/v1/accounts/`,
            url:config.ACCOUNTS_SERVICE_URL,
            pathRewrite:{"^/":"/api/v1/accounts/"},
            name:"accounts-service",
        },
        {
            path:`/api/v1/transactions/`,
            url:config.TRANSACTION_SERVICE_URL,
            pathRewrite:{"^/":"/api/v1/transactions/"},
            name:"transactions-service",
        }
    ]

    private static createProxyOptions(service:ServiceConfig):Options{
           return {
             target:service.url,
             changeOrigin:true,
             pathRewrite:service.pathRewrite,
             timeout:service.timeout || config.DEFAULT_TIMEOUT,
             logger: logger,
             on:{
                error:ProxyService.handleProxyError,
                proxyReq:ProxyService.handleProxyRequest,
                proxyRes:ProxyService.handleProxyResponse,
             }
           }
    }

    private static handleProxyError(err:Error,req:any,res:any):void{
        logger.error(`Proxy error for ${req.path} : ${err.message}`);

        const errorResponse:ProxyErrorResponse = {
            status:500,
            message:err.message,
            timestamp:new Date().toISOString()
        }
        res.status(500).setHeader('Content-Type','application/json').end(JSON.stringify(errorResponse));
    }

    private static handleProxyRequest(proxyReq:any,req:any,res:any):void{
        logger.info(`Proxy request for ${req.path} : ${req.method} ${req.url}`);
    }

    private static handleProxyResponse(proxyRes:any,req:any,res:any):void{
        logger.info(`Proxy response for ${req.path} : ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    }

    public static setUpProxy(app:Application):void{
        ProxyService.serviceConfigd.forEach(service => {
            const options = ProxyService.createProxyOptions(service);
            app.use(service.path,createProxyMiddleware(options));
            logger.info(`Proxy set up for ${service.name} at ${service.path}`);
        });
    }

}

export const proxyServices = (app:Application) => ProxyService.setUpProxy(app);