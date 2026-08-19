require('dotenv').config();

const shared = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  dialect: 'postgres',
  logging: false,
  migrationStorageTableName: 'sequelize_meta',
};

module.exports = { development: shared, test: shared, production: shared };
