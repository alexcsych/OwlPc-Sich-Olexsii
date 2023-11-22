const createHttpError = require('http-errors');
const { Product } = require('./../models');

module.exports.getProducts = async (req, res, next) => {
  const { type, limit, offset } = req.query;
  const newLimit = parseInt(limit, 10) + 1;
  const newOffset = parseInt(offset, 10);
  console.log('query :>> ', type, limit, offset);

  try {
    if (!type) {
      next(createHttpError(400, 'Type parameter is required'));
    }

    const products = await Product.find({ type: type })
      .select('-createdAt -updatedAt -__v')
      .limit(newLimit)
      .skip(newOffset);
    console.log('products :>> ', products);
    const newProducts = products.filter(pr => pr !== null);
    console.log('newProducts :>> ', newProducts);
    res.status(200).send({ data: newProducts });
  } catch (err) {
    next(err);
  }
};
