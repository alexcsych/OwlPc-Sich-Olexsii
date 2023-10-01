const yup = require('yup');

module.exports.signUpSchem = yup.object().shape({
  name: yup.string().required('Name обязательно для заполнения'),
  email: yup
    .string()
    .email('Неверный формат email')
    .required('Email обязателен для заполнения'),
  password: yup
    .string()
    .min(6, 'Password must be 6 characters long')
    .matches(/[0-9]/, 'Password requires a number')
    .matches(/[a-z]/, 'Password requires a lowercase letter')
    .matches(/[A-Z]/, 'Password requires an uppercase letter')
    .matches(/[^\w]/, 'Password requires a symbol')
    .required('Password обязателен для заполнения'),
  role: yup
    .string()
    .oneOf(
      ['customer', 'creator', 'moderator'],
      'Role must be one of the following values: customer, creator, moderator'
    )
    .required('Role обязателен для заполнения'),
});

module.exports.logInSchem = yup.object().shape({
  email: yup
    .string()
    .email('Неверный формат email')
    .required('Email обязателен для заполнения'),
  password: yup
    .string()
    .min(6, 'Password must be 6 characters long')
    .matches(/[0-9]/, 'Password requires a number')
    .matches(/[a-z]/, 'Password requires a lowercase letter')
    .matches(/[A-Z]/, 'Password requires an uppercase letter')
    .matches(/[^\w]/, 'Password requires a symbol')
    .required('Password обязателен для заполнения'),
});
