const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../storage/data/bookmarks.db');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: dbPath,
    logging: console.log,
  },
  production: {
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  },
};
