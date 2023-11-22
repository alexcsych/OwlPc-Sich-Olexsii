const createError = require('http-errors');
const {
  signUpSchem,
  logInSchem,
  updateUserSchem,
  addProductSchem,
  updateQuantitySchem,
} = require('../validation');

const valid = async (req, res, next, schem) => {
  try {
    await schem.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const validationErrors = error.errors || [];
    const customError = createError(
      400,
      'Invalid data. Please check the provided data and try again.'
    );
    customError.validationErrors = validationErrors;
    next(customError);
  }
};

module.exports.validateSignUpData = async (req, res, next) => {
  valid(req, res, next, signUpSchem);
};

module.exports.validateLogInData = async (req, res, next) => {
  valid(req, res, next, logInSchem);
};

module.exports.validateUpdateData = async (req, res, next) => {
  valid(req, res, next, updateUserSchem);
};

module.exports.validateAddProductData = async (req, res, next) => {
  valid(req, res, next, addProductSchem);
};

module.exports.validateUpdateQuantityData = async (req, res, next) => {
  valid(req, res, next, updateQuantitySchem);
};
