const { Router } = require('express');
const usersRouter = Router();
const { usersController } = require('./../controllers');
const { validators } = require('../middleware');

usersRouter
  .route('/signup')
  .post(validators.validateSignUpData, usersController.createUser);

usersRouter
  .route('/login')
  .post(validators.validateLogInData, usersController.loginUser);

usersRouter
  .route('/:_id')
  .put(validators.validateUpdateData, usersController.updateUser);

module.exports = usersRouter;
