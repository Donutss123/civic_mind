import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("DATABASE CONFIG CHECK:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  passwordLoaded: Boolean(process.env.DB_PASSWORD),
});

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl: {
    rejectUnauthorized: false
  },

  max: 5
});

pool.on("error", (err) => {
  console.error("Database error:", err);
});

pool.query(`
  SELECT current_database() AS db,
         current_user AS username
`)
.then((result) => {
  console.log("DATABASE VERIFICATION:", result.rows[0]);
})
.catch((error) => {
  console.error("DATABASE VERIFICATION FAILED:", error);
});