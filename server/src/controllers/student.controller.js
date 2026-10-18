const prisma = require("../lib/prisma");
const { createStudentSchema } = require("../validators/student.validator");

const createStudent = async (req, res) => {
  // 1. Validate the incoming data
  const result = createStudentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // 2. Save to the database
  try {
    const student = await prisma.student.create({ data: result.data });
    return res.status(201).json(student);
  } catch (error) {
    // P2002 is Prisma's code for "unique value already exists"
    if (error.code === "P2002") {
      return res.status(409).json({
        message: `A student with this ${error.meta.target.join(", ")} already exists`,
      });
    }
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { createStudent };