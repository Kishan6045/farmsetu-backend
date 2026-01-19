const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "farmsetu",   // 🔥 MOST IMPORTANT LINE
    });

    console.log("MongoDB Connected");
    console.log("Connected DB:", conn.connection.name); // verify

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
