const http = require('http');
const express = require('express');
// const router = require('./router');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
// app.use(router);

const server = http.createServer(app);
server.listen(PORT, () =>
  console.log(`Example app listening on port ${PORT}!`)
);
