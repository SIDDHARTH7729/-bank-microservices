import {DataSource} from "typeorm";
import { config } from "./config";
import { User } from "./entity/user.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: config.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities:[User,Credential],
})