import { Pool } from 'pg';
import { logger } from './logger';

const connectionString = process.env.AHMED_CAMERA_BACKEND_DB_URI;

const pool = new Pool({
  connectionString: connectionString,
});

const query = async function query(text: string, params: (string | number)[], queryLabel = '') {
  logger.debug({ label: `about to execute db query - ${queryLabel}`, text, params });
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug({ label: `executed db query - ${queryLabel}`, text, params, duration, rowCount: res.rowCount, rows: res.rows });
  return res.rows || res;
};

export {
  query
};
