export const errorHandler = (error, _request, response, _next) => {
  const statusCode = error.code === "LIMIT_FILE_SIZE" ? 400 : error.statusCode || 500;
  const message = error.code === "LIMIT_FILE_SIZE" ? "Uploaded file exceeds the allowed size limit." : error.message || "Unexpected server error.";

  response.status(statusCode).json({
    message
  });
};
