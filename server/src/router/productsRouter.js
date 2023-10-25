const { Router } = require('express');
const productsRouter = Router();
const { productsController } = require('./../controllers');

productsRouter.route('/').get(productsController.getProducts);
// productsRouter.route('/:productId').get(productsController.getProductById);

module.exports = productsRouter;
