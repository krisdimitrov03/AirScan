const { Role } = require('../models');
const { Op } = require('sequelize');

async function getAllRoles({ search, limit = 50, offset = 0 }) {
  let where = {};
  if (search) {
    where = { role_name: { [Op.like]: `%${search}%` } };
  }
  return Role.findAndCountAll({
    where,
    limit,
    offset,
    order: [['role_id', 'ASC']]
  });
}

async function getRoleById(roleId) {
  return Role.findByPk(roleId);
}

async function createRole(role_name) {
  return Role.create({ role_name });
}

async function updateRole(roleId, role_name) {
  const role = await Role.findByPk(roleId);
  if (!role) return null;
  role.role_name = role_name;
  await role.save();
  return role;
}

async function deleteRole(roleId) {
  const deletedCount = await Role.destroy({ where: { role_id: roleId } });
  return deletedCount === 1;
}

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
