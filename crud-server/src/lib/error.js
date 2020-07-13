class RestApiError extends Error {
  constructor(statusCode, message) {
    super();
    this.status = statusCode;
    this.body  = { errors: message };
    this.text = JSON.stringify(this.body);
  }
}

module.exports = RestApiError;
