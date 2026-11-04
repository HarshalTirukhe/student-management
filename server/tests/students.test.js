const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { createUser, loginAs, validStudent } = require("./helpers");

let adminToken;
let viewerToken;

beforeEach(async () => {
  await createUser({ email: "admin@test.com", role: "ADMIN" });
  await createUser({ email: "viewer@test.com", role: "VIEWER" });
  adminToken = await loginAs("admin@test.com");
  viewerToken = await loginAs("viewer@test.com");
});

const as = (token) => ({ Authorization: `Bearer ${token}` });

describe("authentication", () => {
  it("returns 401 for a protected route without a token", async () => {
    const res = await request(app).get("/api/students");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/students", () => {
  it("lets an admin create a student", async () => {
    const res = await request(app)
      .post("/api/students")
      .set(as(adminToken))
      .send(validStudent());

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe("tanvi.mehta@example.com");
  });

  it("returns 403 for a viewer", async () => {
    const res = await request(app)
      .post("/api/students")
      .set(as(viewerToken))
      .send(validStudent());

    expect(res.status).toBe(403);
  });

  it("returns 400 with field errors for invalid data", async () => {
    const res = await request(app)
      .post("/api/students")
      .set(as(adminToken))
      .send(validStudent({ firstName: "", email: "not-an-email" }));

    expect(res.status).toBe(400);
    const fields = res.body.errors.map((error) => error.field);
    expect(fields).toEqual(expect.arrayContaining(["firstName", "email"]));
  });

  it("rejects a date of birth in the future", async () => {
    const res = await request(app)
      .post("/api/students")
      .set(as(adminToken))
      .send(validStudent({ dateOfBirth: "2999-01-01" }));

    expect(res.status).toBe(400);
  });

  it("returns 409 for a duplicate email", async () => {
    await request(app)
      .post("/api/students")
      .set(as(adminToken))
      .send(validStudent());

    const res = await request(app)
      .post("/api/students")
      .set(as(adminToken))
      .send(validStudent({ rollNumber: "CS999" }));

    expect(res.status).toBe(409);
  });
});

describe("GET /api/students", () => {
  beforeEach(async () => {
    await prisma.student.createMany({
      data: [
        validStudent({ email: "a@example.com", rollNumber: "R1", firstName: "Aarav" }),
        validStudent({ email: "b@example.com", rollNumber: "R2", firstName: "Diya" }),
        validStudent({ email: "c@example.com", rollNumber: "R3", firstName: "Rohan" }),
      ].map((student) => ({
        ...student,
        dateOfBirth: new Date(student.dateOfBirth),
      })),
    });
  });

  it("lets a viewer read the list with pagination info", async () => {
    const res = await request(app)
      .get("/api/students?limit=2&page=1")
      .set(as(viewerToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
  });

  it("filters by search text", async () => {
    const res = await request(app)
      .get("/api/students?search=diya")
      .set(as(viewerToken));

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].firstName).toBe("Diya");
  });
});

describe("GET /api/students/:id", () => {
  it("returns 404 for a student that does not exist", async () => {
    const res = await request(app)
      .get("/api/students/999999")
      .set(as(viewerToken));
    expect(res.status).toBe(404);
  });

  it("returns 400 for a non-numeric id", async () => {
    const res = await request(app)
      .get("/api/students/abc")
      .set(as(viewerToken));
    expect(res.status).toBe(400);
  });
});

describe("PUT and DELETE /api/students/:id", () => {
  let studentId;

  beforeEach(async () => {
    const created = await request(app)
      .post("/api/students")
      .set(as(adminToken))
      .send(validStudent());
    studentId = created.body.id;
  });

  it("lets an admin update a student", async () => {
    const res = await request(app)
      .put(`/api/students/${studentId}`)
      .set(as(adminToken))
      .send(validStudent({ course: "Data Science" }));

    expect(res.status).toBe(200);
    expect(res.body.course).toBe("Data Science");
  });

  it("returns 403 when a viewer tries to update", async () => {
    const res = await request(app)
      .put(`/api/students/${studentId}`)
      .set(as(viewerToken))
      .send(validStudent({ course: "Data Science" }));

    expect(res.status).toBe(403);
  });

  it("returns 403 when a viewer tries to delete", async () => {
    const res = await request(app)
      .delete(`/api/students/${studentId}`)
      .set(as(viewerToken));

    expect(res.status).toBe(403);
  });

  it("lets an admin delete, then returns 404 the second time", async () => {
    const first = await request(app)
      .delete(`/api/students/${studentId}`)
      .set(as(adminToken));
    const second = await request(app)
      .delete(`/api/students/${studentId}`)
      .set(as(adminToken));

    expect(first.status).toBe(204);
    expect(second.status).toBe(404);
  });
});