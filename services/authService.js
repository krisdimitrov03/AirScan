const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
require('dotenv').config();

async function registerUser(username, password, roleName, email) {
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) throw new Error('Username already exists');

  const role = await Role.findOne({ where: { role_name: roleName } });
  if (!role) throw new Error('Invalid role');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    password_hash: hashedPassword,
    email,
    role_id: role.role_id
  });

  console.log(`User ${username} created with role ${role}`);


  return newUser;
}

async function loginUser(username, password) {
  const user = await User.findOne({
    where: { username },
    include: [Role]
  });
  if (!user) throw new Error('Invalid username or password');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Invalid username or password');

  const tokenPayload = { user_id: user.user_id, role_id: user.role_id, role_name: user.Role?.role_name };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

  console.log(`User ${username} logged in with role ${roleName}`);

  console.log(token)
  
  return token;
}

module.exports = {
  registerUser,
  loginUser
};
