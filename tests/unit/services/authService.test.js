const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerUser, loginUser } = require("../../../services/authService");
const { User, Role } = require("../../../models");
jest.mock("../../../models", () => ({
  User: { findOne: jest.fn(), create: jest.fn() },
  Role: { findOne: jest.fn() },
}));
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("authService", () => {
  afterEach(() => { jest.clearAllMocks(); });
  
  describe("registerUser", () => {
    it("throws error if username already exists", async () => {
      User.findOne.mockResolvedValue({ user_id: 1 });
      await expect(registerUser("existingUser", "password", "admin", "test@example.com"))
        .rejects.toThrow("Username already exists");
    });
    it("throws error if role is invalid", async () => {
      User.findOne.mockResolvedValue(null);
      Role.findOne.mockResolvedValue(null);
      await expect(registerUser("newUser", "password", "nonexistent", "test@example.com"))
        .rejects.toThrow("Invalid role");
    });
    it("registers a new user successfully", async () => {
      User.findOne.mockResolvedValue(null);
      Role.findOne.mockResolvedValue({ role_id: 2 });
      bcrypt.hash.mockResolvedValue("hashedPassword");
      const newUser = { user_id: 1, username: "newUser", password_hash: "hashedPassword", email: "test@example.com", role_id: 2 };
      User.create.mockResolvedValue(newUser);
      const result = await registerUser("newUser", "password", "admin", "test@example.com");
      expect(bcrypt.hash).toHaveBeenCalledWith("password", 10);
      expect(User.create).toHaveBeenCalledWith({
        username: "newUser",
        password_hash: "hashedPassword",
        email: "test@example.com",
        role_id: 2,
      });
      expect(result).toEqual(newUser);
    });
  });
  
  describe("loginUser", () => {
    it("throws error if user is not found", async () => {
      User.findOne.mockResolvedValue(null);
      await expect(loginUser("nonexistent", "password"))
        .rejects.toThrow("Invalid username or password");
    });
    it("throws error if password does not match", async () => {
      const fakeUser = { user_id: 1, username: "test", password_hash: "hashed", Role: { role_name: "admin" } };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(false);
      await expect(loginUser("test", "wrongpassword"))
        .rejects.toThrow("Invalid username or password");
    });
    it("returns a token if login is successful", async () => {
      const fakeUser = { user_id: 1, username: "test", password_hash: "hashed", role_id: 2, Role: { role_name: "admin" } };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token123");
      const result = await loginUser("test", "password");
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashed");
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, role_id: 2, role_name: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(result).toBe("token123");
    });
  });
});
