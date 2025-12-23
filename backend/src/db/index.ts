import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from '../config';
import * as schema from './schema';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

export async function closeDatabase() {
  await pool.end();
}

