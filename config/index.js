require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    // port: process.env.DB_PORT,
    operatorsAliases: false,
    pool: {
      max: process.env.DB_POOL_MAX,
      min: process.env.DB_POOL_MIN,
      acquire: process.env.DB_POOL_ACQUIRE,
      idle: process.env.DB_POOL_IDLE,
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection database successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync code!");
});

module.exports = sequelize;
