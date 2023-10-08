const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { errorHandlers } = require('./src/middleware');
const router = require('./src/router');
const swaggerDocument = require('./swagger.json');

const app = express();

app.use(express.json());
app.use('/api', router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorHandlers.errorHandler);

module.exports = app;
