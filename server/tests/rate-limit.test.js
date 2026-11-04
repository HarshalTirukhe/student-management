const request = require("supertest");
const app = require("../src/app");

describe("login rate limit", () => {
  it("returns 429 after 5 failed attempts", async () => {
    const attempt = () =>
      request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@test.com", password: "wrongpassword" });

    for (let i = 0; i < 5; i++) {
      const res = await attempt();
      expect(res.status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/too many/i);
  });
});

describe("register rate limit", () => {
  it("returns 429 after 10 sign-ups from one address", async () => {
    const signUp = (n) =>
      request(app)
        .post("/api/auth/register")
        .send({
          name: `User ${n}`,
          email: `user${n}@test.com`,
          password: "password123",
        });

    for (let n = 1; n <= 10; n++) {
      const res = await signUp(n);
      expect(res.status).toBe(201);
    }

    const blocked = await signUp(11);
    expect(blocked.status).toBe(429);
  });
});