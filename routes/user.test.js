const supertest = require("supertest");
const server = require("../server");
const axios = require("axios");

//no connection is made to the database (mongoose.connect is jest.fn()) https://github.com/alonronin/mockingoose/blob/master/README.md
const mockingoose = require("mockingoose").default;
const User = require("../models/userModel");

describe("UserRoute Test", () => {

    it("Should register if user model keys fulfilled with status 201, Axios should get called once.", async () => {
        const newUser = {
            username: "user789",
            password: "password",
            email: "user789@gmail.com"
        };

        // Mock axios post, so email won't actually get sent
        const spy = jest.spyOn(axios, "post").mockImplementation(() => {
            return true;
        });

        const res = await supertest(server)
                .post("/user/register")
                .send(newUser);
    
        mockingoose(User).toReturn(newUser);
        const userRegistered = await User.find();

        expect(userRegistered).toMatchObject(newUser);
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls.length).toBe(1);
        expect(res.status).toBe(201);
    });

    it("Should NOT register if no email, return status 400", async () => {
        const res = await supertest(server)
                .post("/user/register")
                .send({
                    username: "userNumber1",
                    password: "password",
                });
        expect(res.status).toBe(400);
    });

    it("Should reject if no token, attempt to upload avatar, should return 401", async () => {
        const res = await supertest(server).post("/user/avatar")
        expect(res.status).toBe(401);
    });

    it("Should reject if no token, get user data, should return status 401", async () => {
        const res = await supertest(server).get("/user/");
            expect(res.status).toBe(401);
    });

    it("Should reject if no token, attemt to update, should return 401", async () => {
        const res = await supertest(server).put("/user/").send({
            username: "UpdateUser1",
            email: "Updateuser1@gmail.com"
        });
        expect(res.status).toBe(401);
    });

})
