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
      .limit(newLimit)
      .skip(newOffset);
    console.log('products :>> ', products);
    const newProducts = products.filter(pr => pr !== null);
    console.log('newProducts :>> ', newProducts);
    if (newProducts.length > 0) {
      if (newProducts.length === newLimit) {
        newProducts.pop();
      }
      res.status(200).send({ data: { products: newProducts, next: true } });
    } else {
      res.status(200).send({ data: { next: false } });
    }
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
