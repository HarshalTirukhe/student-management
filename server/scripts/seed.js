require("dotenv").config({ override: true });
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

const adminPassword = process.env.DEMO_ADMIN_PASSWORD || "DemoAdmin123";
const viewerPassword = process.env.DEMO_VIEWER_PASSWORD || "DemoViewer123";

const demoUsers = [
  {
    name: "Demo Admin",
    email: "admin@demo.com",
    password: adminPassword,
    role: "ADMIN",
  },
  {
    name: "Demo Viewer",
    email: "viewer@demo.com",
    password: viewerPassword,
    role: "VIEWER",
  },
];

const demoStudents = [
  {
    firstName: "Aarav",
    lastName: "Sharma",
    email: "aarav.sharma@example.com",
    rollNumber: "CS101",
    course: "Computer Science",
    dateOfBirth: "2003-02-11",
  },
  {
    firstName: "Diya",
    lastName: "Patel",
    email: "diya.patel@example.com",
    rollNumber: "CS102",
    course: "Computer Science",
    dateOfBirth: "2002-07-23",
  },
  {
    firstName: "Rohan",
    lastName: "Deshmukh",
    email: "rohan.deshmukh@example.com",
    rollNumber: "DS101",
    course: "Data Science",
    dateOfBirth: "2003-11-05",
  },
  {
    firstName: "Ananya",
    lastName: "Iyer",
    email: "ananya.iyer@example.com",
    rollNumber: "DS102",
    course: "Data Science",
    dateOfBirth: "2004-01-17",
  },
  {
    firstName: "Kabir",
    lastName: "Singh",
    email: "kabir.singh@example.com",
    rollNumber: "IT101",
    course: "Information Technology",
    dateOfBirth: "2002-09-30",
  },
  {
    firstName: "Meera",
    lastName: "Joshi",
    email: "meera.joshi@example.com",
    rollNumber: "IT102",
    course: "Information Technology",
    dateOfBirth: "2003-04-08",
  },
  {
    firstName: "Arjun",
    lastName: "Nair",
    email: "arjun.nair@example.com",
    rollNumber: "EC101",
    course: "Electronics",
    dateOfBirth: "2002-12-14",
  },
  {
    firstName: "Isha",
    lastName: "Kulkarni",
    email: "isha.kulkarni@example.com",
    rollNumber: "EC102",
    course: "Electronics",
    dateOfBirth: "2003-06-21",
  },
  {
    firstName: "Vihaan",
    lastName: "Reddy",
    email: "vihaan.reddy@example.com",
    rollNumber: "ME101",
    course: "Mechanical Engineering",
    dateOfBirth: "2003-03-02",
  },
  {
    firstName: "Saanvi",
    lastName: "Gupta",
    email: "saanvi.gupta@example.com",
    rollNumber: "ME102",
    course: "Mechanical Engineering",
    dateOfBirth: "2004-08-19",
  },
  {
    firstName: "Aditya",
    lastName: "Pawar",
    email: "aditya.pawar@example.com",
    rollNumber: "CS103",
    course: "Computer Science",
    dateOfBirth: "2002-05-27",
  },
  {
    firstName: "Priya",
    lastName: "Menon",
    email: "priya.menon@example.com",
    rollNumber: "DS103",
    course: "Data Science",
    dateOfBirth: "2003-10-09",
  },
  {
    firstName: "Rahul",
    lastName: "Verma",
    email: "rahul.verma@example.com",
    rollNumber: "IT103",
    course: "Information Technology",
    dateOfBirth: "2002-01-31",
  },
  {
    firstName: "Neha",
    lastName: "Bhosale",
    email: "neha.bhosale@example.com",
    rollNumber: "EC103",
    course: "Electronics",
    dateOfBirth: "2004-02-25",
  },
  {
    firstName: "Siddharth",
    lastName: "Rao",
    email: "siddharth.rao@example.com",
    rollNumber: "ME103",
    course: "Mechanical Engineering",
    dateOfBirth: "2003-09-12",
  },
];

async function main() {
  const dbName = new URL(process.env.DATABASE_URL).pathname.slice(1);
  console.log(`Seeding database: ${dbName}`);
  const reset = process.argv.includes("--reset");

  // Demo accounts: created if missing, otherwise put back to a known state
  for (const { password, ...user } of demoUsers) {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { ...user, password: hashed },
      create: { ...user, password: hashed },
    });
  }

  // Optional: wipe every student first, so the demo data is exactly this list
  if (reset) {
    const { count } = await prisma.student.deleteMany();
    console.log(`Reset: removed ${count} existing students`);
  }

  // Sample students: created if missing, left alone if they already exist
  for (const student of demoStudents) {
    await prisma.student.upsert({
      where: { email: student.email },
      update: {},
      create: { ...student, dateOfBirth: new Date(student.dateOfBirth) },
    });
  }

  console.log(
    `Seeded ${demoUsers.length} demo users and ${demoStudents.length} students`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
