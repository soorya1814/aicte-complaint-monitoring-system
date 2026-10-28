import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aicte_complaints';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to host: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error('\n' + '='.repeat(80));
    console.error('❌ MONGODB CONNECTION FAILED');
    console.error('='.repeat(80));
    console.error(`Attempted connection URI: ${uri}`);
    console.error(`Error details: ${error.message}`);
    console.error('\nTROUBLESHOOTING INSTRUCTIONS:');
    console.error('1. Local MongoDB (Windows):');
    console.error('   - Ensure MongoDB Community Edition is installed: https://www.mongodb.com/try/download/community');
    console.error('   - Open PowerShell as Administrator and run: "net start MongoDB"');
    console.error('2. MongoDB Atlas (Cloud):');
    console.error('   - Create a free cluster at https://www.mongodb.com/cloud/atlas');
    console.error('   - Set MONGODB_URI in server/.env with your connection string:');
    console.error('     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/aicte_complaints?retryWrites=true&w=majority');
    console.error('3. Automated Testing:');
    console.error('   - Running "npm test" uses mongodb-memory-server and does not require local mongod.');
    console.error('='.repeat(80) + '\n');
    return null;
  }
};

export const getDBStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null,
  };
};
