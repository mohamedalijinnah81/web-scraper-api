function logRequest(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`);
  next();
}

module.exports = { logRequest };
