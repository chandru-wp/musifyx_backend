import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ msg: "No token provided, authorization denied" });
  }

  // Handle Simulation Mode Tokens
  // Any token starting with sim-id- is treated as valid for local testing
  if (token.startsWith("sim-id-") || token === "demo-id") {
    req.user = {
      id: token,
      role: token.toLowerCase().includes("admin") ? "ADMIN" : "USER"
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey123");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ msg: "Access denied: Admins only" });
  }
};
