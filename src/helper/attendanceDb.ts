import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_ATT_USER,
  host: process.env.DB_ATT_HOST,
  database: process.env.DB_ATT_NAME,
  password: process.env.DB_ATT_PASSWORD,
  port: Number(process.env.DB_ATT_PORT),
});

// Helper function to execute a query
export const attendanceQuery = async (
  query: string,
  params: any[] = []
): Promise<any[]> => {
  let client: PoolClient | null = null;
  console.log("pool line -------- 36", pool);
  try {
    client = await pool.connect(); // Connect to DB
    const result = await client.query(query, params); // Execute query
    return result.rows; // Return rows from the result
  } catch (error: any) {
    throw new Error(`Database query failed: ${error.message}`);
  } finally {
    if (client) {
      client.release(); // Release connection back to the pool
    }
  }
};

// Method to get a client from the pool for transactions
export const getAttendance = async (): Promise<PoolClient> => {
  console.log("pool line ------ 52", pool);
  const client = await pool.connect(); // Return a connected client
  return client;
};

// Optionally, create a method to close the pool when the app shuts down
export const closeAttendance = async () => {
  console.log("pool line ------ 59", pool);
  try {
    await pool.end();
    console.log("Database pool has been closed.");
  } catch (error: any) {
    console.error("Error while closing the database pool:", error.message);
  }
};
