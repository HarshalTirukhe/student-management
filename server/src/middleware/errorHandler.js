const errorHandler = (err, req, res, next) => {
  // Bad JSON in the request body (e.g. a trailing comma)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }

  // Unique value already exists
  if (err.code === "P2002") {
    return res.status(409).json({
      message: `A record with this ${err.meta.target.join(", ")} already exists`,
    });
  }

  // Record not found
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Student not found" });
  }

  // Anything unexpected
  console.error(err);
  return res.status(500).json({ message: "Something went wrong" });
};

module.exports = errorHandler;