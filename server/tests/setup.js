const path = require("path");

// override: true makes sure the test values win over anything already set
require("dotenv").config({
  path: path.join(__dirname, "..", ".env.test"),
  override: true,
});

// Safety guard: never run against a real database
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes("test")) {
  throw new Error(
    "Refusing to run tests: DATABASE_URL must point to a test database",
  );
}