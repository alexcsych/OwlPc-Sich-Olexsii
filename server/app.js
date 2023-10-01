const express = require('express');
const { errorHandlers } = require('./src/middleware');
const router = require('./src/router');

const app = express();

app.use(express.json());

app.use('/api', router);

app.use(errorHandlers.errorHandler);

module.exports = app;
