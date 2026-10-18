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

const getStudents = async (req, res) => {
  // 1. Read page, limit and search from the URL, with safe defaults
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const search = req.query.search?.trim();

  // 2. Build the search filter (empty filter = match everything)
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

  try {
    // 3. Fetch one page of students and the total count at the same time
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ]);

    return res.json({
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { createStudent, getStudents };