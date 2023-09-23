const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { DATABASE, HOST, DBPORT } = process.env;

const basename = path.basename(__filename);

(async () => {
  try {
    await mongoose.connect(`mongodb://${HOST}:${DBPORT}/${DATABASE}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
})();

const db = {};

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    db[model.modelName] = model;
  });

db.mongoose = mongoose;

module.exports = db;
