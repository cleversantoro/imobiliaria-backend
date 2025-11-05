const mysql = require('mysql2/promise');
const { env } = require('../config/env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const formatConnectionError = (error) => {
  if (!error) {
    return 'Unknown database connection error';
  }

  const messages = [];

  if (error.code) {
    messages.push(error.code);
  }

  if (error.message) {
    messages.push(error.message);
  }

  if (Array.isArray(error.errors) && error.errors.length > 0) {
    error.errors.forEach((err) => {
      if (err) {
        const parts = [err.code, err.message].filter(Boolean);
        if (parts.length > 0) {
          messages.push(parts.join(': '));
        }
      }
    });
  }

  return messages.join(' | ') || error.toString();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const testConnection = async (options = {}) => {
  const {
    retries = 0,
    delay = 2000,
    onAttempt = () => {},
  } = options;

  let attempt = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let connection;
    try {
      onAttempt(attempt + 1);
      connection = await pool.getConnection();
      await connection.ping();
      return;
    } catch (error) {
      const formattedError = formatConnectionError(error);
      const enhancedError = new Error(
        `Unable to reach MySQL at ${env.db.host}:${env.db.port} (${formattedError})`,
      );
      enhancedError.originalError = error;

      if (attempt >= retries) {
        throw enhancedError;
      }

      attempt += 1;
      await sleep(delay);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
};

module.exports = {
  pool,
  testConnection,
};
