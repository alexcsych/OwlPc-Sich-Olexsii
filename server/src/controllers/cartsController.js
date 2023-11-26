const createHttpError = require('http-errors');
const { Cart } = require('./../models');

module.exports.addProduct = async (req, res, next) => {
  const { user, product } = req.body;
  try {
    const findedProduct = await Cart.findOne({ user: user, product: product });

    if (findedProduct) {
      return next(createHttpError(409, 'The product is already in your cart.'));
    }

    const addedProduct = await Cart.create({ user: user, product: product });

    if (!addedProduct) {
      return next(createHttpError(400, 'Bad Request'));
    }
    const { createdAt, updatedAt, __v, ...rest } = addedProduct._doc;

    res.status(201).send({ data: rest });
  } catch (err) {
    next(err);
  }
};

module.exports.getProducts = async (req, res, next) => {
  const { type, limit, offset } = req.query;
  const newLimit = parseInt(limit, 10) + 1;
  const newOffset = parseInt(offset, 10);

  const { userId } = req.params;
  try {
    let totalSum = 0;
    const summ = await Cart.find({ user: userId }).populate('product');
    summ.forEach(cartItem => {
      const { product, quantity } = cartItem;
      const { price } = product;

      totalSum += price * quantity;
    });

    const findedProducts = await Cart.find({ user: userId })
      .populate('product')
      .limit(newLimit)
      .skip(newOffset);

    const products = findedProducts.reduce((result, pr) => {
      const { createdAt, updatedAt, __v, ...rest } = pr.product._doc;
      result[rest._id] = { ...rest, quantity: pr.quantity };
      return result;
    }, {});

    res.status(200).send({ data: { products, totalSum } });
  } catch (err) {
    next(err);
  }
};

module.exports.removeProduct = async (req, res, next) => {
  const { user, product } = req.query;
  try {
    const deletedProducts = await Cart.deleteOne({
      user: user,
      product: product,
    });

    if (deletedProducts.deletedCount === 0) {
      return next(createHttpError(404, 'Not Found'));
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports.updateQuantity = async (req, res, next) => {
  try {
    const updatePromises = req.body.updateProducts.map(async item => {
      const filter = { user: item.user, product: item.product };
      const update = { $set: { quantity: item.quantity } };

      return Cart.updateMany(filter, update);
    });

    const updatedPromises = await Promise.all(updatePromises);

    if (!updatedPromises) {
      return next(createHttpError(400, 'Bad Request'));
    }

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};
