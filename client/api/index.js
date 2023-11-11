require('dotenv').config();
const axios = require('axios');

const { SERVER_API_URL } = process.env;
const httpClient = axios.create({ baseURL: SERVER_API_URL });

const getCartProducts = async (id, limit, offset) =>
  await httpClient.get(`/carts/${id}?limit=${limit}&&offset=${offset}`);

const getProducts = async (type, limit, offset) =>
  await httpClient.get(
    `/products/?type=${type}&&limit=${limit}&&offset=${offset}`
  );

const addProduct = async body => await httpClient.post(`/carts`, body);

const removeProduct = async (id, productId) =>
  await httpClient.delete(`/carts?user=${id}&&product=${productId}`);

const loginUser = async body => await httpClient.post(`/users/login`, body);

const signupUser = async body => await httpClient.post(`/users/signup`, body);

const updateUser = async (id, body) =>
  await httpClient.patch(`/users/${id}`, body);

const updateQuantity = async body => await httpClient.patch('/carts', body);

module.exports.API = {
  getCartProducts,
  getProducts,
  addProduct,
  removeProduct,
  loginUser,
  signupUser,
  updateUser,
  updateQuantity,
};
