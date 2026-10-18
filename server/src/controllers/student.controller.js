const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { createStudentSchema } = require("../validators/student.validator");

// Builds the 400 response used by both create and update
const sendValidationError = (res, error) =>
  res.status(400).json({
    message: "Validation failed",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });

const createStudent = asyncHandler(async (req, res) => {
  const result = createStudentSchema.safeParse(req.body);
  if (!result.success) return sendValidationError(res, result.error);

  const student = await prisma.student.create({ data: result.data });
  res.status(201).json(student);
});

const getStudents = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const search = req.query.search?.trim();

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { rollNumber: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.count({ where }),
  ]);

  res.json({
    data: students,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const getStudentById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Student id must be a number" });
  }

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});

const updateStudent = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Student id must be a number" });
  }

  const result = createStudentSchema.safeParse(req.body);
  if (!result.success) return sendValidationError(res, result.error);

  const student = await prisma.student.update({
    where: { id },
    data: result.data,
  });
  res.json(student);
});

const deleteStudent = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Student id must be a number" });
  }

  await prisma.student.delete({ where: { id } });
  res.status(204).send();
});

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};