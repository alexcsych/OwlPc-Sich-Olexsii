const createHttpError = require('http-errors');
const { Cart } = require('./../models');

module.exports.addProduct = async (req, res, next) => {
  console.log('addProduct');
  const { user, product } = req.body;
  console.log('user, product :>> ', user, product);
  try {
    const findedProduct = await Cart.findOne({ user: user, product: product });
    console.log('findedProduct :>> ', findedProduct);

    if (findedProduct) {
      return next(createHttpError(400, 'The product is already in your cart.'));
    }

    const addedProduct = await Cart.create({ user: user, product: product });
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
    let totalSum = 0;
    const summ = await Cart.find({ user: userId }).populate('product');
    summ.forEach(cartItem => {
      const { product, quantity } = cartItem;
      const { price } = product;

      totalSum += price * quantity;
    });
    console.log('totalSum :>> ', totalSum);

    const findedProducts = await Cart.find({ user: userId })
      .populate('product')
      .limit(newLimit)
      .skip(newOffset);
    console.log('findedProducts :>> ', findedProducts);

    console.log('findedProducts.length :>> ', findedProducts.length);
    const products = findedProducts.reduce((result, pr) => {
      const { createdAt, updatedAt, __v, ...rest } = pr.product._doc;
      result[rest._id] = { ...rest, quantity: pr.quantity };
      return result;
    }, {});

    console.log('products :>> ', products);
    res.status(201).send({ data: { products, totalSum } });
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

module.exports.updateQuantity = async (req, res, next) => {
  console.log('updateQuantity');
  console.log('req.body :>> ', req.body);
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
