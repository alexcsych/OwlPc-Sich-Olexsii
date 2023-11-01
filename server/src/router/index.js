const { Router } = require('express');
const usersRouter = require('./usersRouter');
const productsRouter = require('./productsRouter');
const cartsRouter = require('./cartsRouter');

const router = Router();

router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/carts', cartsRouter);

module.exports = router;
