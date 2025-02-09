const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Role = require("./Role");

const User = sequelize.define(
  "User",
  {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    role_id: {
      type: DataTypes.INTEGER,
      references: { model: Role, key: "role_id" },
      allowNull: true,
    },
  },
  { tableName: "users", timestamps: false }
);

module.exports = User;
