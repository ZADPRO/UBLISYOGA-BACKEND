import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

// const pool = new Pool({
//   user: process.env.DB_USER || "postgres",
//   host: process.env.DB_HOST || "13.232.190.189",
//   database: process.env.DB_NAME || "ublis_backend",
//   password: process.env.DB_PASSWORD || "1967",
//   port: Number(process.env.DB_PORT) || 5432,
// });

const pool = new Pool({
  user: process.env.DB_USER || "attendance",
  host: process.env.DB_HOST || "13.203.158.161",
  database: process.env.DB_NAME || "attendance",
  password: process.env.DB_PASSWORD || "ublisattendance",
  port: Number(process.env.DB_PORT) || 5432,
});

// Helper function to execute a query
export const attendanceQuery = async (
  query: string,
  params: any[] = []
): Promise<any[]> => {
  let client: PoolClient | null = null; 
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
  const client = await pool.connect(); // Return a connected client
  return client;
};

// Optionally, create a method to close the pool when the app shuts down
export const closeAttendance = async () => {
  try {
    await pool.end();
    console.log("Database pool has been closed.");
  } catch (error: any) {
    console.error("Error while closing the database pool:", error.message);
  }
};
