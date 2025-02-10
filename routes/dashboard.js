const router = require("express").Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const roles = require("../constants/roles");

router.use(verifyToken, authorizeRoles([roles.ANALYST, roles.ADMIN]));

router.get("/", verifyToken, (req, res) => {
  res.render("analyst/dashboard", { title: "Dashboard", user: req.user });
});

module.exports = router;
