import jwt from "jsonwebtoken";
import ms from "ms";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { config } from "../config";
import redis from "../config/redis";
import { Repository } from "typeorm";
import { Credential } from "../entity/credential.entity";
import { User } from "../entity/user.entity";
import { createError } from "../utils";
import { publishUserRegistered } from "../events/producers/userRegisteredProducer";

interface RegisterDto {
    firstName: string,
    lastName: string,
    email: string,
    password: string
}

interface LoginDto {
    email: string,
    password: string
}

export class AuthService {
    credentialRepository: Repository<Credential>
    userRepository: Repository<User>

    constructor() {
        this.credentialRepository = AppDataSource.getRepository(Credential)
        this.userRepository = AppDataSource.getRepository(User)
    }

    async register({ firstName, lastName, email, password }: RegisterDto) {
        const existing = await this.credentialRepository.findOneBy({ email });

        if (existing) throw createError("Email already exists", 400);

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User()
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;

        await this.userRepository.save(user);

        const credential = new Credential()
        credential.email = email;
        credential.password = hashedPassword;
        credential.user = user;

        await this.credentialRepository.save(credential);

        await publishUserRegistered({
            key: user.id?.toString() || "0",
            value: user,
        });
    }

    async login({ email, password }: LoginDto) {
        const credential = await this.credentialRepository.findOne({
            where: { email },
            relations: ['user']
        });

        if (!credential) throw createError("Invalid credentials", 401);

        const isValid = await bcrypt.compare(password, credential.password);
        if (!isValid) throw createError("Invalid credentials", 401);

        const token = jwt.sign({
            id: credential.user.id,
            email: credential.user.email,
            firstName: credential.user.firstName,
            lastName: credential.user.lastName
        },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN as ms.StringValue });
        
        await redis.setex(
            `auth:${credential.user.id}:${token}`,24*60*60,'true'
        )

        return {
            token,
            firstName: credential.user.firstName,
            lastName: credential.user.lastName,
            email: credential.user.email
        }    
    }

    async logout(userId: number, token: string) {
        await redis.del(`auth:${userId}:${token}`)
    }
}

