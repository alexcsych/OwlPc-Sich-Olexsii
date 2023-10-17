const createHttpError = require('http-errors');
const { Product } = require('./../models');

module.exports.getProducts = async (req, res, next) => {
  const { query } = req;
  console.log('query :>> ', query);
  try {
    if (!query.type) {
      next(createHttpError(400, 'Type parameter is required'));
    }

    const products = await Product.find({ type: query.type });
    console.log('products :>> ', products);

    res.status(200).send({ data: products });
  } catch (err) {
    next(err);
  }
};

module.exports.getProductById = async (req, res, next) => {
  const { params } = req;
  console.log('params :>> ', params);
  try {
    if (!params.productId) {
      next(createHttpError(400, 'ProductId parameter is required'));
    }

    const product = await Product.findOne({ _id: params.productId }).select(
      '-_id -createdAt -updatedAt -__v'
    );
    console.log('product :>> ', product);

    if (!product) {
      next(createHttpError(404, 'Product not found'));
    }

    res.status(200).send({ data: product });
  } catch (err) {
    next(err);
  }
};
