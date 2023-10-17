const yup = require('yup');
const { User } = require('../models');

module.exports.signUpSchem = yup.object().shape({
  name: yup.string().required('Name is required'),
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
