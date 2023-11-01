const mongoose = require('mongoose');

const Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', Schema);

module.exports = Cart;
