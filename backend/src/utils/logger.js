const format = (level, message, meta) => {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta
  };
  return JSON.stringify(payload);
};

const logger = {
  info(message, meta = {}) {
    console.log(format("info", message, meta));
  },
  warn(message, meta = {}) {
    console.warn(format("warn", message, meta));
  },
  error(message, meta = {}) {
    console.error(format("error", message, meta));
  }
};

module.exports = {
  logger
};
