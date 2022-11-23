import { Pool } from 'pg';
import { logger } from './logger';

const connectionString = process.env.NODEAPP_DB_URI;

const pool = new Pool({
  connectionString: connectionString,
});

const query = async function query(text: string, params: (string | number)[], queryLabel = '') {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug({ label: `executed db query - ${queryLabel}`, text, params, duration, rowCount: res.rowCount, rows: res.rows });
  return res;
};

export {
  query
};
