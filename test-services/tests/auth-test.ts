import {
    apiGateway,
    registerUser,
    loginUser,
    testUser,
    getTestUser
} from "./utils";


describe("Auth Service Tests",()=>{
    test("User registration should return 201 created",async ()=>{
        testUser.currentTestUser=getTestUser()
        const response = await registerUser(testUser.currentTestUser);
        console.log(response.status);
        console.log(response.body);
        expect(response.status).toBe(201);
        expect(response.body.email).toBe(testUser.currentTestUser.email);
    })

    test("Registration with existing email should return 400",async ()=>{
        const response = await registerUser(testUser.currentTestUser);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email already exists");
    })

    test("User login should return 200",async ()=>{
        const response = await loginUser({email:testUser.currentTestUser.email,password:testUser.currentTestUser.password});
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(typeof response.body.token).toBe("string");
        expect(response.body.email).toBe(testUser.currentTestUser.email);
        expect(testUser.authToken).not.toBe("");
    })

    test("Login with invalid credentials should return 400 unauthorised",async ()=>{
        const response = await apiGateway().post("/api/v1/auth/login").send({email:"naya@gmail.com",password:"invalid"});
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
    })

    test("User logout should return 200",async ()=>{
        const response = await apiGateway().post("/api/v1/auth/logout").set("Authorization", `Bearer ${testUser.authToken}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Logout successful");
        testUser.authToken="";
    })




})