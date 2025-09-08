const jwt = require("jsonwebtoken");
const { User } = require("../model/indexModel");
const JWT = process.env.JWT_SECRET;

const signedToken = async (payload) => {
  return jwt.sign(payload, JWT, { expiresIn: "8h" });
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.send({ status: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) return res.send({ status: false, message: "Session expired" });

    res.locals.user = { email: user.email, role: user.role };
    next();
  } catch {
    res.send({ status: false, message: "Failed to authenticate token" });
  }
};

const adminOnly = async (req, res, next) => {
  const user = res.locals.user;

  if (user.role !== "admin") {
    return res.send({ status: false, message: "Admins only" });
  }
  next();
};

module.exports = { signedToken, verifyToken, adminOnly };
