const { User, Role } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function bulkCreateUsers(userArray) {
  if (!Array.isArray(userArray)) {
    throw new Error("Data must be an array of user objects.");
  }
  const processedUsers = await Promise.all(userArray.map(async (user) => {
    if (user.password) {
      user.password_hash = await bcrypt.hash(user.password, 10);
      delete user.password;
    }
    return user;
  }));
  return await User.bulkCreate(processedUsers, { validate: true });
}

async function countAdmins() {
  return User.count({
    include: [{ model: Role, where: { role_name: 'admin' } }]
  });
}

async function getAllUsers({ search, limit = 50, offset = 0 }) {
  let where = {};
  if (search) {
    // username or email
    where = {
      [Op.or]: [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    };
  }
  return User.findAndCountAll({
    include: [Role],
    where,
    limit,
    offset,
    order: [['user_id', 'ASC']]
  });
}

async function getUserById(userId) {
  return User.findByPk(userId, { include: [Role] });
}

async function createUser({ username, password, email, role_id }) {
  const existing = await User.findOne({ where: { username } });
  if (existing) throw new Error('Username already exists');

  const hashed = await bcrypt.hash(password, 10);

  return User.create({
    username,
    password_hash: hashed,
    email,
    role_id
  });
}

async function updateUser(userId, { username, password, email, role_id }) {
  const user = await User.findByPk(userId);
  if (!user) return null;

  if (username) user.username = username;
  if (email) user.email = email;
  if (role_id) user.role_id = role_id;
  if (password) user.password_hash = await bcrypt.hash(password, 10);

  await user.save();
  return user;
}

async function deleteUser(userId) {
  const user = await User.findByPk(userId);
  if (!user) return false;
  await user.destroy();
  return true;
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  countAdmins,
  bulkCreateUsers
};
