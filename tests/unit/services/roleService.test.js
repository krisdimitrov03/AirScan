const roleService = require("../../../services/roleService");
const { Role } = require("../../../models");
const { Op } = require("sequelize");
jest.mock("../../../models", () => ({
  Role: { findAndCountAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), destroy: jest.fn() },
}));

describe("roleService", () => {
  afterEach(() => { jest.clearAllMocks(); });
  
  describe("getAllRoles", () => {
    it("returns roles without search filter", async () => {
      const rolesData = { rows: [{ role_id: 1, role_name: "admin" }], count: 1 };
      Role.findAndCountAll.mockResolvedValue(rolesData);
      const result = await roleService.getAllRoles({});
      expect(Role.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 50,
        offset: 0,
        order: [["role_id", "ASC"]],
      });
      expect(result).toEqual(rolesData);
    });
    it("applies search filter", async () => {
      const rolesData = { rows: [{ role_id: 1, role_name: "admin" }], count: 1 };
      Role.findAndCountAll.mockResolvedValue(rolesData);
      const result = await roleService.getAllRoles({ search: "adm", limit: 10, offset: 0 });
      expect(Role.findAndCountAll).toHaveBeenCalledWith({
        where: { role_name: { [Op.like]: `%adm%` } },
        limit: 10,
        offset: 0,
        order: [["role_id", "ASC"]],
      });
      expect(result).toEqual(rolesData);
    });
  });
  
  describe("getRoleById", () => {
    it("returns role by id", async () => {
      const role = { role_id: 1, role_name: "admin" };
      Role.findByPk.mockResolvedValue(role);
      const result = await roleService.getRoleById(1);
      expect(Role.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(role);
    });
  });
  
  describe("createRole", () => {
    it("creates a new role", async () => {
      const roleData = { role_name: "manager" };
      const createdRole = { role_id: 2, ...roleData };
      Role.create.mockResolvedValue(createdRole);
      const result = await roleService.createRole("manager");
      expect(Role.create).toHaveBeenCalledWith({ role_name: "manager" });
      expect(result).toEqual(createdRole);
    });
  });
  
  describe("updateRole", () => {
    it("updates a role", async () => {
      const roleInstance = {
        role_id: 1,
        role_name: "admin",
        save: jest.fn().mockResolvedValue({ role_id: 1, role_name: "superadmin" }),
      };
      Role.findByPk.mockResolvedValue(roleInstance);
      const result = await roleService.updateRole(1, "superadmin");
      expect(Role.findByPk).toHaveBeenCalledWith(1);
      expect(roleInstance.role_name).toBe("superadmin");
      expect(roleInstance.save).toHaveBeenCalled();
      expect(result).toMatchObject({ role_id: 1, role_name: "superadmin" });
    });
    it("returns null if role not found", async () => {
      Role.findByPk.mockResolvedValue(null);
      const result = await roleService.updateRole(999, "newname");
      expect(result).toBeNull();
    });
  });
  
  describe("deleteRole", () => {
    it("returns true if deletion is successful", async () => {
      Role.destroy.mockResolvedValue(1);
      const result = await roleService.deleteRole(1);
      expect(Role.destroy).toHaveBeenCalledWith({ where: { role_id: 1 } });
      expect(result).toBe(true);
    });
    it("returns false if deletion fails", async () => {
      Role.destroy.mockResolvedValue(0);
      const result = await roleService.deleteRole(999);
      expect(result).toBe(false);
    });
  });
});
