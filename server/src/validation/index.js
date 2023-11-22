const yup = require('yup');
const { User, Product } = require('../models');

module.exports.signUpSchem = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be 2 characters long')
    .required('Name is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .test(
      'is-unique',
      'This email is already registered',
      async function (value) {
        const user = await User.findOne({ email: value });
        return !user;
      }
    )
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be 6 characters long')
    .matches(/[0-9]/, 'Password requires a number')
    .matches(/[a-z]/, 'Password requires a lowercase letter')
    .matches(/[A-Z]/, 'Password requires an uppercase letter')
    .matches(/[^\w]/, 'Password requires a symbol')
    .required('Password is required'),
  role: yup
    .string()
    .oneOf(
      ['customer', 'creator', 'moderator'],
      'Role must be one of the following values: customer, creator, moderator'
    )
    .required('Role is required'),
});

module.exports.logInSchem = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be 6 characters long')
    .matches(/[0-9]/, 'Password requires a number')
    .matches(/[a-z]/, 'Password requires a lowercase letter')
    .matches(/[A-Z]/, 'Password requires an uppercase letter')
    .matches(/[^\w]/, 'Password requires a symbol')
    .required('Password is required'),
});

module.exports.updateUserSchem = yup.object().shape({
  name: yup.string().min(2, 'Name must be 2 characters long'),
  email: yup
    .string()
    .email('Invalid email format')
    .test(
      'is-unique',
      'This email is already registered',
      async function (value) {
        const user = await User.findOne({ email: value });
        return !user;
      }
    ),
  password: yup
    .string()
    .min(6, 'Password must be 6 characters long')
    .matches(/[0-9]/, 'Password requires a number')
    .matches(/[a-z]/, 'Password requires a lowercase letter')
    .matches(/[A-Z]/, 'Password requires an uppercase letter')
    .matches(/[^\w]/, 'Password requires a symbol'),
});

module.exports.addProductSchem = yup.object().shape({
  user: yup
    .string()
    .test('is', 'There are no users with this id', async function (value) {
      const user = await User.findOne({ email: value });
      return !user;
    })
    .required('Name is required'),
  product: yup
    .string()
    .test('is', 'There are no products with this id', async function (value) {
      const user = await Product.findOne({ email: value });
      return !user;
    })
    .required('Products is required'),
});

module.exports.addProductSchem = yup.object().shape({
  user: yup
    .string()
    .test('is', 'There are no users with this id', async function (value) {
      const user = await User.findOne({ email: value });
      return !user;
    })
    .required('Name is required'),
  product: yup
    .string()
    .test('is', 'There are no products with this id', async function (value) {
      const user = await Product.findOne({ email: value });
      return !user;
    })
    .required('Products is required'),
});

module.exports.updateQuantitySchem = yup.object().shape({
  updateProducts: yup.array().of(
    yup.object().shape({
      user: yup.string().required('Name is required'),
      product: yup.string().required('Product is required'),
      quantity: yup
        .number()
        .min(0, 'Quantity must be greater than or equal to 0')
        .required('Quantity is required'),
    })
  ),
});
