const prisma = require("../src/lib/prisma");

// Every test starts with empty tables
beforeEach(async () => {
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});