const app = require('./app');
const { env } = require('./config/env');
const { testConnection } = require('./db/pool');

const start = async () => {
  try {
    await testConnection({
      retries: 5,
      delay: 2000,
      onAttempt: (attempt) => {
        console.log(`Checking database connection (attempt ${attempt})...`);
      },
    });

    console.log('Database connection ready. Starting API...');

    app.listen(env.port, () => {
      console.log(`API running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message || error);
    if (error.originalError) {
      console.error('Database connection error details:', error.originalError);
    }
    process.exit(1);
  }
};

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

start();
