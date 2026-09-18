import express from "express"
import cors from "cors"
import axios from "axios"
import pool from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();
pool.query("SELECT NOW()")
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.log("PostgreSQL connection error:", err));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api", authRoutes);


app.post("/api/tests", authMiddleware, async (req, res) => {
  const { type, field, expected, result, method, url } = req.body;

  try {
    const dbResult = await pool.query(
      `INSERT INTO tests (type, field, expected, result, user_id, method, url)
       VALUES ($1, $2, $3, $4, $5,$6,$7)
       RETURNING *`,
      [type, field, expected, result, req.user.userId, method, url]
    );

    res.json(dbResult.rows[0]);
  } catch (error) {
    console.log("DATABASE ERROR:", error);
    res.status(500).json({ error: "Failed to save test" });
  }
});
app.get("/api/tests", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tests WHERE user_id = $1",
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.log("DATABASE ERROR:", error);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});
app.post("/api/test", authMiddleware, async (req, res) => {
  const { method, url, headers, body } = req.body;

  try {
    const response = await axios({
      method,
      url,
      headers,
      data: body
    });
    await pool.query(
      `INSERT INTO request_history (method, url, status, user_id)
   VALUES ($1, $2, $3, $4)`,
      [method, url, response.status, req.user.userId]
    );
    res.json({
      status: response.status,
      data: response.data
    });

  } catch (error) {
    console.log("ERROR CAUGHT:", error.message);

    if (!error.response) {
      res.status(400).json({
        status: 400,
        error: "Invalid URL or network error",
        message: error.message
      });
      return;
    }

    res.status(error.response.status).json({
      status: error.response.status,
      error: "Request failed",
      message: error.message
    });
  }
});
app.delete("/api/tests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const dbResult = await pool.query(
      `DELETE FROM tests
   WHERE id = $1 AND user_id = $2
   RETURNING *`,
      [id, req.user.userId]
    );

    res.json(dbResult.rows[0]);
  } catch (error) {
    console.log("DATABASE ERROR:", error);
    res.status(500).json({ error: "Failed to delete test" });
  }
});
app.put("/api/tests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { type, field, expected, result } = req.body;

  try {
    const dbResult = await pool.query(
      `UPDATE tests
       SET type = $1, field = $2, expected = $3, result = $4
       WHERE id = $5 AND user_id = $6 
       RETURNING *`,
      [type, field, expected, result, id, req.user.userId]
    );

    res.json(dbResult.rows[0]);
  } catch (error) {
    console.log("DATABASE ERROR:", error);
    res.status(500).json({ error: "Failed to update test" });
  }
});
app.get("/api/history", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM request_history
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});
app.delete("/api/history", authMiddleware, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM request_history WHERE user_id = $1",
      [req.user.userId]
    );

    res.json({ message: "History cleared" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to clear history" });
  }
});
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port 5000");
});