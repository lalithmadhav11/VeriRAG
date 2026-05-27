/**
 * Wraps an async Express route controller so that unhandled Promise
 * rejections are automatically passed to the next() error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  asyncHandler
};
