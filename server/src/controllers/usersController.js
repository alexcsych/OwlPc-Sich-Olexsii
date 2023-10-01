require('dotenv').config();
const bcrypt = require('bcrypt');
const createHttpError = require('http-errors');
const { User } = require('./../models');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);

module.exports.createUser = async (req, res, next) => {
  const { body } = req;
  console.log('createUser');
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    body.password = hashedPassword;
    const createdUser = await User.create(body);

    if (!createdUser) {
      return next(createHttpError(400, 'Bad Request'));
    }

    res.status(201).send({ data: createdUser });
  } catch (err) {
    next(err);
  }
};

module.exports.loginUser = async (req, res, next) => {
  const { body } = req;
  console.log('loginUser');
  console.log('body :>> ', body);

  try {
    const foundUser = await User.findOne({ email: body.email });

    if (!foundUser) {
      return next(createHttpError(404, 'User Not Found'));
    }
    console.log('body.password :>> ', body.password);
    console.log('foundUser.password :>> ', foundUser.password);
    const isPasswordValid = await bcrypt.compare(
      body.password,
      foundUser.password
    );

    if (!isPasswordValid) {
      return next(createHttpError(401, 'Invalid Password'));
    }

    res.status(200).send({ data: foundUser });
  } catch (err) {
    next(err);
  }
};
