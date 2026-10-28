import { MongoMemoryServer } from '../server/node_modules/mongodb-memory-server/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../data/db');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

async function startLocalMongo() {
  console.log('='.repeat(70));
  console.log('🍃 Starting AICTE Local MongoDB Server on Port 27017...');
  console.log(`📁 Persistent storage path: ${dbPath}`);
  console.log('='.repeat(70));

  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: dbPath,
        storageEngine: 'wiredTiger',
      },
    });

    const uri = mongod.getUri();
    console.log(`\n✅ MongoDB Service is ACTIVE and listening!`);
    console.log(`🌐 Connection URI: mongodb://127.0.0.1:27017/aicte_complaints`);
    console.log(`💡 The backend server and seed script can now connect directly.\n`);

    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('\nStopping MongoDB Server...');
      await mongod.stop();
      process.exit(0);
    });
  } catch (error) {
    if (error.message.includes('EADDRINUSE') || error.message.includes('port')) {
      console.log('ℹ️ Port 27017 is already in use by an active MongoDB instance. Connecting to existing service.');
    } else {
      console.error('Error starting local MongoDB:', error.message);
    }
  }
}

startLocalMongo();
