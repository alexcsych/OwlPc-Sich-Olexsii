require('dotenv').config();
const bcrypt = require('bcrypt');
const createHttpError = require('http-errors');
const { User, Cart } = require('./../models');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);

module.exports.createUser = async (req, res, next) => {
  const { body } = req;
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    body.password = hashedPassword;
    const createdUser = await User.create(body);

    if (!createdUser) {
      return next(createHttpError(400, 'Bad Request'));
    }
    const { password, createdAt, updatedAt, __v, ...rest } = createdUser._doc;
    const cart = await Cart.find({ user: rest._id });
    const newCart = cart.map(c => c.product);

    res.status(201).send({ data: { user: rest, cart: newCart } });
  } catch (err) {
    next(err);
  }
};

module.exports.loginUser = async (req, res, next) => {
  const { body } = req;

  try {
    const foundUser = await User.findOne({ email: body.email }).select(
      '-createdAt -updatedAt -__v'
    );

    if (!foundUser) {
      return next(createHttpError(404, 'User Not Found'));
    }
    const isPasswordValid = await bcrypt.compare(
      body.password,
      foundUser.password
    );

    if (!isPasswordValid) {
      return next(createHttpError(401, 'Invalid Password'));
    }

    const { password, ...rest } = foundUser._doc;

    const cart = await Cart.find({ user: rest._id });
    const newCart = cart.map(c => c.product);

    res.status(200).send({ data: { user: rest, cart: newCart } });
  } catch (err) {
    next(err);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
    }
    const updatedUser = await User.findOneAndUpdate(req.params, req.body, {
      new: true,
    }).select('-password -createdAt -updatedAt -__v');
    if (!updatedUser) {
      return next(createHttpError(404, 'User Not Found'));
    }

    return res.status(200).send({ data: updatedUser });
  } catch (err) {
    next(err);
  }
};
