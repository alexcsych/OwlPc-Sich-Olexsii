const { Router } = require('express');
const cartsRouter = Router();
const { cartsController } = require('./../controllers');

cartsRouter
  .route('/')
  .post(cartsController.addProduct)
  .delete(cartsController.removeProduct);

cartsRouter.route('/:userId').get(cartsController.getProducts);

module.exports = cartsRouter;
