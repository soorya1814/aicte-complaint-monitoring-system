import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Validate critical env variables
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ WARNING: JWT_SECRET environment variable is not defined. Using temporary development fallback secret.');
  }

  // Connect to Database
  await connectDB();

  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log(`🚀 AICTE Complaint Monitoring Server running on port: ${PORT}`);
    console.log(`🌐 Base API URL: http://localhost:${PORT}/api`);
    console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(70) + '\n');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
};

startServer();
