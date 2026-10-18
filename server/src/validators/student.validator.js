const { z } = require("zod");

const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  rollNumber: z.string().min(1, "Roll number is required"),
  course: z.string().min(1, "Course is required"),
  dateOfBirth: z.coerce.date().refine(
  (date) => date <= new Date(),
  "Date of birth cannot be in the future")
});

module.exports = { createStudentSchema };
