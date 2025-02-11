const router = require("express").Router();
const { verifyNoToken } = require("../middlewares/authMiddleware");
const { loginUser } = require("../services/authService");

router.get("/login", verifyNoToken, (req, res) => {
  res.render("auth/login", { title: "Login", error: null });
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await loginUser(username, password);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (err) {
    res.render("auth/login", { title: "Login", error: err.message });
  }
});

router.get("/logout", (_, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

module.exports = router;
