import { Pool, QueryResult, QueryResultRow } from 'pg';

/**
 * Robust Database Connection Utility for Next.js
 * 
 * Next.js development mode utilizes Hot Module Replacement (HMR) which can cause 
 * your database connection code to execute multiple times, rapidly depleting 
 * identical database connection pool limits. Check connection instance 
 * globally before instantiating a new one.
 */

// Extend NodeJS Global object to store our cached DB pool
const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
};

// Initialize the PostgreSQL DB Pool
// Falls back to the cached pool to prevent connection exhaustion 
export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    
    // Robust Connection Pool Settings:
    max: 20, // Max number of authorized clients dynamically in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if a connection cannot be established
  });

// Cache the pool in development mode specifically
if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}

/**
 * Generic Utility function to execute raw SQL statements securely.
 * Automatically handles parameterized queries avoiding SQL Injection vectors.
 * 
 * Example Usage inside an API Route or Server Component:
 * const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
 * 
 * @param text The SQL Query String with parameterized indices ($1, $2, etc.)
 * @param params An array of values strictly substituting parameters sequentially
 * @returns PostgreSQL QueryResult containing `.rows` and metadata
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  
  try {
    // pool.query safely checks out a connection, executes, and automatically releases it back.
    const res = await pool.query<T>(text, params);
    
    const duration = Date.now() - start;
    
    // Developer Observability - Logs execution time internally
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DB Query Executed] \u23F1\uFE0F ${duration}ms | Rows: ${res.rowCount} | Target: ${text}`);
    }
    
    return res;
    
  } catch (error) {
    console.error(`[DB Critical] Query Execution Failure: ${text}`, error);
    // Throw error so the parent caller (API Block/Server Component) can elegantly handle specific 500 Responses
    throw error;
  }
}
