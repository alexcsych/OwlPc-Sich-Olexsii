const mongoose = require('mongoose');

const validRoles = ['customer', 'creator', 'moderator'];

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', Schema);

module.exports = User;
