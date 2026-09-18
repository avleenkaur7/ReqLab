import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Reqlab",
  password: "#AK6006",
  port: 5432
});

export default pool;