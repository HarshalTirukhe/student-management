const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { createUser, loginAs } = require("./helpers");

describe("GET /health", () => {
  it("responds ok without a token", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/auth/register", () => {
  const body = {
    name: "Harshal",
    email: "harshal@test.com",
    password: "mypassword123",
  };

  it("creates a viewer and never returns or stores the plain password", async () => {
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("VIEWER");
    expect(res.body.password).toBeUndefined();

    const stored = await prisma.user.findUnique({
      where: { email: body.email },
    });
    expect(stored.password).not.toBe(body.password);
    expect(stored.password.startsWith("$2")).toBe(true); // bcrypt hash
  });

  it("ignores a role sent by the client", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...body, role: "ADMIN" });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("VIEWER");
  });

  it("returns 409 for a duplicate email", async () => {
    await request(app).post("/api/auth/register").send(body);
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.status).toBe(409);
  });

  it("returns 400 with a field error for a short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...body, password: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("password");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await createUser({ email: "harshal@test.com" });
  });

  it("returns a token for correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "harshal@test.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.password).toBeUndefined();
  });

  it("returns 401 for a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "harshal@test.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("returns the same 401 message for an unknown email", async () => {
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: "harshal@test.com", password: "wrongpassword" });
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "password123" });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("returns the user for a valid token", async () => {
    await createUser({ email: "harshal@test.com" });
    const token = await loginAs("harshal@test.com");

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("harshal@test.com");
  });
});