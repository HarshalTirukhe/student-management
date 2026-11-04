const bcrypt = require("bcryptjs");
const request = require("supertest");
const prisma = require("../src/lib/prisma");
const app = require("../src/app");

// Create a user straight in the database (so we can make admins)
async function createUser({
  name = "Test User",
  email,
  password = "password123",
  role = "VIEWER",
}) {
  const hashed = await bcrypt.hash(password, 4); // low cost = fast tests
  return prisma.user.create({ data: { name, email, password: hashed, role } });
}

// Log in through the real endpoint and return the token
async function loginAs(email, password = "password123") {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  return res.body.token;
}

const validStudent = (overrides = {}) => ({
  firstName: "Tanvi",
  lastName: "Mehta",
  email: "tanvi.mehta@example.com",
  rollNumber: "CS201",
  course: "Computer Science",
  dateOfBirth: "2003-08-15",
  ...overrides,
});

module.exports = { createUser, loginAs, validStudent };