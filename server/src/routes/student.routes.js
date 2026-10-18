const express = require("express");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
} = require("../controllers/student.controller");

const router = express.Router();

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);

module.exports = router;
