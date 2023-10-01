const mongoose = require('mongoose');
const yup = require('yup');

const validRoles = ['customer', 'creator', 'moderator'];
const EMAIL_VALIDATION_SCHEMA = yup.string().email();

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: v => EMAIL_VALIDATION_SCHEMA.isValidSync(v),
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: validRoles,
    },
    cart: [
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', Schema);

module.exports = User;
