const { Router } = require('express');
const productsRouter = Router();
const { productsController } = require('./../controllers');

productsRouter.route('/').get(productsController.getProducts);

module.exports = productsRouter;
