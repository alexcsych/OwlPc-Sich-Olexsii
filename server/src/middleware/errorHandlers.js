module.exports.errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return;
  }

  const status = err.status ?? 500;
  const errors = {
    status,
    title: err.message ?? 'Server Error',
  };
  let newErrors;
  err.validationErrors
    ? (newErrors = { ...errors, validationErrors: err.validationErrors })
    : (newErrors = { ...errors });

  res.status(status).send({
    errors: newErrors,
  });
};
