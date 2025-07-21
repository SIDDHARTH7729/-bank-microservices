import {
    testUser,
    apiGateway,
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
                                            .post("/api/v1/accounts")
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
                                            .post("/api/v1/accounts")
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
                                        .get("/api/v1/accounts")
                                        .set("Authorization", `Bearer ${testUser.authToken}`)
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);

    const accountNumbers = response.body.map(
        (account:any) => account.accountNumber
    )

    for(const {accountNumber} of testUser.accounts){
        expect(accountNumbers).toContain(accountNumber);
    }
   })

   test("Internal credit transaction should return 200",async ()=>{
    const amount = 10000.01;
    const response = await apiGateway().post("/api/v1/accounts/internal/transaction")
                                        .set("Authorization", `Bearer ${testUser.authToken}`)
                                        .send({
                                            accountNumber:testUser.accounts[0].accountNumber,
                                            amount,
                                            type:"credit"
                                        })
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`Account transaction credit successfully`);
    testUser.accounts[0].balance=response.body.balance;
   })

   test("Internal debit transaction should return 400",async ()=>{
    const amount = 10001.01;
    const response = await apiGateway().post("/api/v1/accounts/internal/transaction")
                                       .set("Authorization", `Bearer ${testUser.authToken}`)
                                       .send({
                                           accountNumber:testUser.accounts[0].accountNumber,
                                           amount,
                                           type:"debit"
                                       })
      
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Insufficient balance");                               
   })

   test("Internal debit transaction should return 200",async ()=>{
    const amount = 1000;
    const response = await apiGateway().post("/api/v1/accounts/internal/transaction")
                                       .set("Authorization", `Bearer ${testUser.authToken}`)
                                       .send({
                                           accountNumber:testUser.accounts[0].accountNumber,
                                           amount,
                                           type:"debit"
                                       })
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(`Account transaction debit successfully`);
      testUser.accounts[0].balance=response.body.balance;                   
   })

   test("Delete account should return 200",async ()=>{
    const accountToDelete = testUser.accounts[0];
    const response = await apiGateway().delete(`/api/v1/accounts/${accountToDelete.accountNumber}`)
                                        .set("Authorization", `Bearer ${testUser.authToken}`)

         expect(response.status).toBe(200);
         expect(response.body.message).toBe(`Account ${accountToDelete.accountNumber} deleted successfully for user`);         
         testUser.accounts = testUser.accounts.filter(
            (account)=>account.accountNumber !== accountToDelete.accountNumber
         )          
   })

   test("List accounts should throw 401  logged out token",async ()=>{
    const loggedOutResponse = await apiGateway().post("/api/v1/auth/logout")
                                                .set("Authorization",`Bearer ${testUser.authToken}`)
         expect(loggedOutResponse.status).toBe(200);
         expect(loggedOutResponse.body.message).toBe("Logout successful");   
         
     const response = await apiGateway().get("/api/v1/accounts")
                                        .set("Authorization", `Bearer ${testUser.authToken}`)
                                        
           expect(response.status).toBe(403);
           expect(response.body.message).toBe("Unauthorized");
           
           testUser.authToken = "";
   })


})