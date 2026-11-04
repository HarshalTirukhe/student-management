module.exports = {
  testEnvironment: "node",
  setupFiles: ["./tests/setup.js"],
  setupFilesAfterEnv: ["./tests/cleanup.js"],
  testMatch: ["**/tests/**/*.test.js"],
};