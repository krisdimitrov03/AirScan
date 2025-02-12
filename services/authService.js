const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");
require("dotenv").config();

async function loginUser(username, password) {
  const user = await User.findOne({
    where: { username },
    include: [Role],
  });
  if (!user) throw new Error("Invalid username or password");

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("Invalid username or password");

  const tokenPayload = {
    user_id: user.user_id,
    username: user.username,
    role_id: user.role_id,
    role_name: user.Role?.role_name,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
}

module.exports = {
  loginUser,
};
