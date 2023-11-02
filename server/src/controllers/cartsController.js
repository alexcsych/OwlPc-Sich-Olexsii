const createHttpError = require('http-errors');
const { Cart } = require('./../models');

module.exports.addProduct = async (req, res, next) => {
  const { body } = req;
  console.log('addProduct');
  try {
    const addedProduct = await Cart.create(body);
    console.log('addToCart :>> ', addedProduct);

    if (!addedProduct) {
      return next(createHttpError(400, 'Bad Request'));
    }
    res.status(201).send({ data: addedProduct });
  } catch (err) {
    next(err);
  }
};

module.exports.getProducts = async (req, res, next) => {
  const { type, limit, offset } = req.query;
  const newLimit = parseInt(limit, 10) + 1;
  const newOffset = parseInt(offset, 10);
  console.log('query :>> ', type, limit, offset);

  const { userId } = req.params;
  console.log('userId :>> ', userId);
  console.log(' req.params :>> ', req.params);
  console.log('getProducts');
  try {
    const findedProducts = await Cart.find({ user: userId })
      .populate('product')
      .limit(newLimit)
      .skip(newOffset);
    console.log('findedProducts :>> ', findedProducts);

    if (!findedProducts) {
      return next(createHttpError(404, 'Not Found'));
    }

    const products = findedProducts.map(pr => {
      const { createdAt, updatedAt, __v, ...rest } = pr.product._doc;
      return rest;
    });
    console.log('products.length :>> ', products.length);
    res.status(201).send({ data: products });
  } catch (err) {
    next(err);
  }
};

module.exports.removeProduct = async (req, res, next) => {
  console.log('removeProduct');
  const { user, product } = req.query;
  console.log('user, product :>> ', user, product);
  try {
    const deletedProducts = await Cart.deleteOne({
      user: user,
      product: product,
    });
    console.log('deletedProducts :>> ', deletedProducts);

    if (!deletedProducts) {
      return next(createHttpError(404, 'Not Found'));
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
