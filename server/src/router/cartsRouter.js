const { Router } = require('express');
const cartsRouter = Router();
const { cartsController } = require('./../controllers');
const { validators } = require('../middleware');

cartsRouter
  .route('/')
  .post(validators.validateAddProductData, cartsController.addProduct)
  .patch(validators.validateUpdateQuantityData, cartsController.updateQuantity)
  .delete(cartsController.removeProduct);

cartsRouter.route('/:userId').get(cartsController.getProducts);

module.exports = cartsRouter;
