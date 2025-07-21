import { apiGateway, account, auth } from "./utils";

describe("Health test checks",()=>{
    test("API Gateway health check should return 200 OK",async ()=>{
       const response = await apiGateway().get("/health");
       expect(response.status).toBe(200);
       expect(response.body).toHaveProperty("status","Server is up and Running");
    })

    test("Account service health check should return 200 OK",async ()=>{
        const response = await account().get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status","Server is up and Running");
     })
    
     test("Auth service health check should return 200 OK",async ()=>{
        const response = await auth().get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status","Server is up and Running");
     })
})