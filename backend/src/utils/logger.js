const winston = require("winston");
const { format } = winston;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: "rag-hallucination-firewall" },
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    })
  ]
});

module.exports = {
  logger
};
