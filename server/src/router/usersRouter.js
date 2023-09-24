const { Router } = require('express');
const usersRouter = Router();
const { usersController } = require('./../controllers');

usersRouter
  .route('/signup')
  // .get(usersController.getUsers)
  .post(usersController.createUser);

module.exports = usersRouter;
