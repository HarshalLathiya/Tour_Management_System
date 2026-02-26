import pool from "./db";

async function check() {
  try {
    const result = await pool.query(`
      SELECT * FROM tour_users 
      ORDER BY id DESC LIMIT 5
    `);
    console.log("Latest tour_users entries:", JSON.stringify(result.rows, null, 2));
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await pool.end();
  }
}

check();
