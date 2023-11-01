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
    console.log('products :>> ', products);
    res.status(201).send({ data: products });
  } catch (err) {
    next(err);
  }
};
