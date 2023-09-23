const mongoose = require('mongoose');

const validTypes = [
  'Видеокарта',
  'Процессор',
  'Корпус',
  'Материнская плата',
  'Оперативная память',
];

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
    fansAmount: Number,
    RAMslotsAmount: Number,
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
