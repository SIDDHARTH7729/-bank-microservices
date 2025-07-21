import { Request,Response } from "express";
import {z} from "zod";
import { AuthService } from "../services/auth.services";

const registerSchema = z.object({
    firstName : z.string().min(3).max(20),
    lastName : z.string().min(3).max(20),
    email : z.string().email(),
    password : z.string().min(6).max(20)
})

const loginSchema = z.object({
    email : z.string().email(),
    password : z.string().min(6).max(20)
})

export class AuthController{
    private authService:AuthService

    constructor(){
        this.authService = new AuthService()
    }

    async register(req:Request,res:Response){
        const {firstName,lastName,email,password} = registerSchema.parse(req.body);

        const user = await this.authService.register({
            firstName,
            lastName,
            email,
            password
        })

        return res.status(201).json(user);
    }

    async login(req:Request,res:Response){
        const {email,password} = loginSchema.parse(req.body);
        const {token} = await this.authService.login({
            email,
            password
        })

        return res.status(200).json({token,email});
    }

    async logout(req:Request,res:Response){
        await this.authService.logout(req.userId!,req.token!);

        return res.status(200).json({message:"Logout successful"});
    }
}