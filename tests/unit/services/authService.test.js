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
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loginUser", () => {
    it("throws error if user is not found", async () => {
      User.findOne.mockResolvedValue(null);
      await expect(loginUser("nonexistent", "password")).rejects.toThrow(
        "Invalid username or password"
      );
    });
    it("throws error if password does not match", async () => {
      const fakeUser = {
        user_id: 1,
        username: "test",
        password_hash: "hashed",
        Role: { role_name: "admin" },
      };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(false);
      await expect(loginUser("test", "wrongpassword")).rejects.toThrow(
        "Invalid username or password"
      );
    });
    it("returns a token if login is successful", async () => {
      const fakeUser = {
        user_id: 1,
        username: "test",
        password_hash: "hashed",
        role_id: 2,
        Role: { role_name: "admin" },
      };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token123");
      const result = await loginUser("test", "password");
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashed");
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, username: "test", role_id: 2, role_name: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(result).toBe("token123");
    });
  });
});
