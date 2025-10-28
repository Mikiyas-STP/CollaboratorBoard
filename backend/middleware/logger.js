const logger = (req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${
    req.originalUrl
  }`;
  console.log(logMessage);
  next();
};
module.exports = logger;
