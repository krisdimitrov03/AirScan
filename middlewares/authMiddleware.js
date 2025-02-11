const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies?.token;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1] || authHeader; // if there is a Bearer token, extract it
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Failed to authenticate token" });
    req.user = decoded;
    next();
  });
};

const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    const userRoleId = req.user?.role_id;
    if (!userRoleId)
      return res.status(403).json({ message: "No role attached to token" });
    
    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ message: "Not enough privileges" });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };