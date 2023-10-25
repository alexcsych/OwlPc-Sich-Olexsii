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
    console.log('createdUser');
    const createdUser = await User.create(body);
    console.log('createdUser :>> ', createdUser);

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
    const foundUser = await User.findOne({ email: body.email }).select(
      '-_id -cart -createdAt -updatedAt -__v'
    );

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

    console.log('foundUser :>> ', foundUser);
    const newFoundUser = { ...foundUser._doc, password: undefined };
    console.log('newFoundUser :>> ', newFoundUser);

    res.status(200).send({ data: newFoundUser });
  } catch (err) {
    next(err);
  }
};

module.exports.updateUser = async (req, res, next) => {
  console.log('updateUser');
  console.log('req.params :>> ', req.params);
  console.log('req.body :>> ', req.body);
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
    }
    const updatedUser = await User.findOneAndUpdate(req.params, req.body, {
      new: true,
    }).select('-_id -password -cart -createdAt -updatedAt -__v');
    console.log('updatedUser :>> ', updatedUser);
    if (!updatedUser) {
      return next(createHttpError(404, 'User Not Found'));
    }

    return res.status(200).send({ data: updatedUser });
  } catch (err) {
    next(err);
  }
};
