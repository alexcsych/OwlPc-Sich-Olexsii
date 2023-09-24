const express = require('express');
const { errorHandlers } = require('./src/middleware');
const router = require('./src/router');

const app = express();

app.use(express.json());

app.use(errorHandlers.errorHandler);

app.use('/api', router);

module.exports = app;
