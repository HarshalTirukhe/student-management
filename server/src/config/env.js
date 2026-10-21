const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

// Safe default so jwt.sign never receives an undefined expiry
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";