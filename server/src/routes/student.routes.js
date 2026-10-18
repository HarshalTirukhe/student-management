const express = require("express");
const { createStudent, getStudents,getStudentById } = require("../controllers/student.controller");

const router = express.Router();

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);

module.exports = router;