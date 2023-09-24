const http = require('http');
require('dotenv').config();
require('./src/models');
const app = require('./app');

const PORT = process.env.PORT ?? 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is listening port ${PORT}`);
});
