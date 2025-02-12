const bcrypt = require("bcrypt");
const userService = require("../../../services/userService");
const { User, Role } = require("../../../models");
const { Op } = require("sequelize");
jest.mock("../../../models", () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    findAndCountAll: jest.fn(),
  },
  Role: {},
}));
jest.mock("bcrypt");

describe("userService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("countAdmins", () => {
    it("returns count of admins", async () => {
      User.count.mockResolvedValue(2);
      const result = await userService.countAdmins();
      expect(User.count).toHaveBeenCalledWith({
        include: [{ model: Role, where: { role_name: "admin" } }],
      });
      expect(result).toBe(2);
    });
  });

  describe("getAllUsers", () => {
    it("returns all users without search", async () => {
      const usersData = { rows: [{ user_id: 1 }], count: 1 };
      User.findAndCountAll.mockResolvedValue(usersData);
      const result = await userService.getAllUsers({});
      expect(User.findAndCountAll).toHaveBeenCalledWith({
        include: [Role],
        where: {},
        limit: 50,
        offset: 0,
        order: [["user_id", "ASC"]],
      });
      expect(result).toEqual(usersData);
    });
    it("applies search filter", async () => {
      const usersData = { rows: [{ user_id: 1 }], count: 1 };
      User.findAndCountAll.mockResolvedValue(usersData);
      const result = await userService.getAllUsers({
        search: "test",
        limit: 10,
        offset: 0,
      });
      expect(User.findAndCountAll).toHaveBeenCalledWith({
        include: [Role],
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%test%` } },
            { email: { [Op.like]: `%test%` } },
          ],
        },
        limit: 10,
        offset: 0,
        order: [["user_id", "ASC"]],
      });
      expect(result).toEqual(usersData);
    });
  });

  describe("getUserById", () => {
    it("returns user by id", async () => {
      const user = { user_id: 1 };
      User.findByPk.mockResolvedValue(user);
      const result = await userService.getUserById(1);
      expect(User.findByPk).toHaveBeenCalledWith(1, { include: [Role] });
      expect(result).toEqual(user);
    });
  });

  describe("createUser", () => {
    it("throws error if user already exists", async () => {
      User.findOne.mockResolvedValue({ user_id: 1 });
      await expect(
        userService.createUser({
          username: "test",
          password: "pass",
          email: "test@example.com",
          role_id: 1,
        })
      ).rejects.toThrow("Username already exists");
    });
    it("creates a new user successfully", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPass");
      const newUser = {
        user_id: 1,
        username: "test",
        password_hash: "hashedPass",
        email: "test@example.com",
        role_id: 1,
      };
      User.create.mockResolvedValue(newUser);
      const result = await userService.createUser({
        username: "test",
        password: "pass",
        email: "test@example.com",
        role_id: 1,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10);
      expect(User.create).toHaveBeenCalledWith({
        username: "test",
        password_hash: "hashedPass",
        email: "test@example.com",
        role_id: 1,
      });
      expect(result).toEqual(newUser);
    });
  });

  describe("updateUser", () => {
    it("returns null if user not found", async () => {
      User.findByPk.mockResolvedValue(null);
      const result = await userService.updateUser(999, { username: "updated" });
      expect(result).toBeNull();
    });
    it("updates user details", async () => {
      const userInstance = {
        user_id: 1,
        username: "old",
        email: "old@example.com",
        role_id: 1,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findByPk.mockResolvedValue(userInstance);
      bcrypt.hash.mockResolvedValue("newHashedPass");
      const result = await userService.updateUser(1, {
        username: "new",
        password: "newpass",
        email: "new@example.com",
        role_id: 2,
      });
      expect(userInstance.username).toBe("new");
      expect(userInstance.email).toBe("new@example.com");
      expect(userInstance.role_id).toBe(2);
      expect(bcrypt.hash).toHaveBeenCalledWith("newpass", 10);
      expect(userInstance.save).toHaveBeenCalled();
      expect(result).toEqual(userInstance);
    });
  });

  describe("deleteUser", () => {
    it("returns false if user not found", async () => {
      User.findByPk.mockResolvedValue(null);
      const result = await userService.deleteUser(999);
      expect(result).toBe(false);
    });
    it("deletes user and returns true", async () => {
      const userInstance = { destroy: jest.fn().mockResolvedValue(true) };
      User.findByPk.mockResolvedValue(userInstance);
      const result = await userService.deleteUser(1);
      expect(userInstance.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
