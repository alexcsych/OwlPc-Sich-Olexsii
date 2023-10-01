const createError = require('http-errors');
const { signUpSchem, logInSchem } = require('../validation');

module.exports.validateSignUpData = async (req, res, next) => {
  try {
    await signUpSchem.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const validationErrors = error.errors || [];
    const customError = createError(
      400,
      'Invalid registration data. Please check the provided data and try again.'
    );
    customError.validationErrors = validationErrors;
    next(customError);
  }
};

module.exports.validateLogInData = async (req, res, next) => {
  try {
    console.log('validateLogInData');
    await logInSchem.validate(req.body, { abortEarly: false });
    console.log('validateLogInData1');
    next();
  } catch (error) {
    const validationErrors = error.errors || [];
    const customError = createError(
      400,
      'Invalid login data. Please check the provided data and try again.'
    );
    customError.validationErrors = validationErrors;
    next(customError);
  }
};
