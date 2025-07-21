import {
    testUser,
    apiGateway,
    getTestUser,
    loginUser,
    cleanUpResources
} from "./utils";

describe("Account Service tests",()=>{
   beforeAll(async ()=>{
      if(!testUser.authToken){
        await loginUser({
            email:testUser.currentTestUser.email,
            password:testUser.currentTestUser.password
        })
      }
   })

   afterAll(async ()=>{
        await cleanUpResources()
   })

   test("Create account should return 201",async ()=>{
          const response = await apiGateway()
                                            .post("/api/v1/acounts")
                                            .set("Authorization", `Bearer ${testUser.authToken}`)
                                            .send({
                                                accountType:"current",
                                                accountName:"Test Current account"
                                            });

         expect(response.status).toBe(201);
         expect(response.body).toHaveProperty("userId");              
         expect(response.body).toHaveProperty("accountName","Test Current account");
         expect(response.body).toHaveProperty("accountType","current");      
         testUser.accounts.push(response.body);               
   })

   test("Creating another account should return 201",async ()=>{
        const response = await apiGateway()
                                            .post("/api/v1/acounts")
                                            .set("Authorization", `Bearer ${testUser.authToken}`)
                                            .send({
                                                accountType:"savings",
                                                accountName:"Test Savings account"
                                            });

       expect(response.status).toBe(201);
       expect(response.body).toHaveProperty("userId");              
       expect(response.body).toHaveProperty("accountName","Test Savings account");
       expect(response.body).toHaveProperty("accountType","savings");      
       testUser.accounts.push(response.body);               
   })

   test("List accounts should return 200 OK and array of accounts",async ()=>{
    const response = await apiGateway()
                                        .get("/api/v1/acounts")
                                        .set("Authorization", `Bearer ${testUser.authToken}`)
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);

   })

   


})