import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log("SIGNUP ERROR:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

   res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none"
});

res.json({
  message: "Login successful"
});

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ error: "Login failed" });
  }
});
router.post("/logout", (req, res) => {
 res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "none"
});

  res.json({ message: "Logout successful" });
});
  router.get("/me", authMiddleware, (req, res) => {
  res.json({
    user: req.user
  });
});
export default router;