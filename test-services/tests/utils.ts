import request from "supertest";
import { Config } from "./config";
import { AccountType,UserType } from "./type";

export const getTestUser = (): UserType =>({
    firstName:"siddhchk",
    lastName:"siddhchklast",
    email:"siddhchk@gmail.com",
    password:"siddhchk"
})

export const testUser = {
    authToken:"",
    userId:"",
    currentTestUser:getTestUser(),
    accounts: [] as AccountType[],
};

export const cleanUpState = () =>{
    testUser.authToken="",
    testUser.userId="",
    testUser.currentTestUser=getTestUser(),
    testUser.accounts = [];
};

export const apiGateway = () => request(Config.apiGatewayUrl);
export const auth = () => request(Config.authUrl);
export const account = () => request(Config.accountUrl);

export async function registerUser(user:UserType){
    const response = await apiGateway().post("/api/v1/auth/register").send(user)
    return response;
}

export async function loginUser({email,password}:{email:string,password:string}){
     const response = await apiGateway().post("/api/v1/auth/login").send({email,password})
     if(response.status===200 && response.body.token){
        testUser.authToken = response.body.token
     }

     return response;
}

export function authenticatedRequest(){
    return apiGateway().set("Authorization", `Bearer ${testUser.authToken}`)
}

export async function cleanUpResources(){
    for(const account of testUser.accounts){
        try {
            await apiGateway().delete(`/api/v1/accounts/${account.accountNumber}`)
            .set("Authorization", `Bearer ${testUser.authToken}`);
        } catch (error) {
            console.error(`
                Failed to delete account ${account.accountNumber}
            `);
            
        }
    }
}
