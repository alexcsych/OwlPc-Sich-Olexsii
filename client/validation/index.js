const yup = require('yup');

const Schems = {
  name: yup
    .string()
    .min(2, 'Name must be 2 characters long')
    .required('Name is required'),
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
  role: yup
    .string()
    .matches(/^customer$/, 'Role must be set to customer')
    .required('Role is required'),
};

module.exports = {
  validName: Schems.name,
  validEmail: Schems.email,
  validPassword: Schems.password,
  signUpSchem: yup.object().shape({
    name: Schems.name,
    email: Schems.email,
    password: Schems.password,
    role: Schems.role,
  }),
  logInSchem: yup.object().shape({
    email: Schems.email,
    password: Schems.password,
  }),
  updateUserSchem: yup.object().shape({
    name: Schems.name,
    email: Schems.email,
    password: Schems.password,
  }),
};
