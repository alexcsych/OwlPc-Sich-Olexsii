const { User } = require('./../models');

module.exports.createUser = async (req, res, next) => {
  const { body } = req;
  try {
    const createdUser = await User.create(body);

    if (!createdUser) {
      return next(createHttpError(400, 'Bad Request'));
    }

    res.status(201).send({ data: createdUser });
  } catch (err) {
    next(err);
  }
};

module.exports.getUsers = async (req, res, next) => {
  const { limit = 10 } = req.query;

  try {
    const foundUser = await User.find().sort({ _id: 1 }).limit(limit).skip(0);

    res.status(200).send({ data: foundUser });
  } catch (err) {
    next(err);
  }
};
