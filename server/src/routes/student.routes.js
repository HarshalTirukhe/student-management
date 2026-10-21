const express = require("express");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/student.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = express.Router();

// Every student route requires a logged-in user
router.use(authenticate);

// Everyone logged in can read
router.get("/", getStudents);
router.get("/:id", getStudentById);

// Only admins can change data
router.post("/", authorize("ADMIN"), createStudent);
router.put("/:id", authorize("ADMIN"), updateStudent);
router.delete("/:id", authorize("ADMIN"), deleteStudent);

module.exports = router;