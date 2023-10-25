const mongoose = require('mongoose');

const validTypes = ['Video Card', 'CPU', 'Case', 'Motherboard', 'RAM'];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: validTypes,
    },
    price: {
      type: Number,
      required: true,
    },
    memory: String,
    memoryType: String,
    cores: Number,
    formFactor: String,
    socket: String,
    fansAmount: Number,
    RAMslotsAmount: Number,
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
