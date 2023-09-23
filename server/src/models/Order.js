const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.methods.calculateTotalPrice = async function () {
  try {
    const productPrices = await Promise.all(
      this.products.map(async item => {
        const product = await mongoose.model('Product').findById(item.product);
        return product ? product.price * item.quantity : 0;
      })
    );

    this.totalPrice = productPrices.reduce((acc, current) => acc + current, 0);
    await this.save();
  } catch (error) {
    throw error;
  }
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
