import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, "my-secret-key");

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }

};

export default authMiddleware;