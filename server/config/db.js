const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4 — fixes Windows DNS/SRV issues
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB attempt ${retries}/${maxRetries} failed: ${error.message}`);
      if (retries === maxRetries) {
        console.error('💥 Could not connect to MongoDB. Exiting.');
        process.exit(1);
      }
      console.log(`⏳ Retrying in 3 seconds...`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;