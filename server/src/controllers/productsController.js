const createHttpError = require('http-errors');
const { Product } = require('./../models');

module.exports.getProducts = async (req, res, next) => {
  const { query } = req;
  console.log('query :>> ', query);
  try {
    if (!query.type) {
      throw createHttpError(400, 'Type parameter is required');
    }

    const products = await Product.find({ type: query.type });
    console.log('products :>> ', products);

    res.status(200).send({ data: products });
  } catch (err) {
    next(err);
  }
};
