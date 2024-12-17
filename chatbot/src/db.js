import config from './config.js';
import pkg from 'pg';
const { Pool } = pkg;

if (!config.postgres.username || 
  !config.postgres.password ||
  !config.postgres.hostname ||
  !config.postgres.port ||
  !config.postgres.dbname
) {
  throw new Error('Postgres configuration is missing.');
}

export const pool = new Pool({
connectionString: `postgresql://${config.postgres.username}:${config.postgres.password}@${config.postgres.hostname}:${config.postgres.port}/${config.postgres.dbname}`,
});