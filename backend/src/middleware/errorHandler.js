/**
 * Application error with an HTTP status code.
 * Thrown by controllers/services; rendered as JSON by the central
 * error handler in app.js.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message human-readable message
   * @param {Record<string, string>} [details] optional per-field errors
   */
  constructor(statusCode, message, details) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static badRequest(message = "Bad request", details) {
    return new ApiError(400, message, details);
  }
}
