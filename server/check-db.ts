import pool from "./db";

async function check() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tour_users' 
      ORDER BY ordinal_position
    `);
    console.log("tour_users columns:", JSON.stringify(result.rows, null, 2));

    // Check existing data
    const dataResult = await pool.query("SELECT * FROM tour_users LIMIT 5");
    console.log("Sample data:", JSON.stringify(dataResult.rows, null, 2));
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await pool.end();
  }
}

check();
