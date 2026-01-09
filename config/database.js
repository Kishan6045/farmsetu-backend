const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error(
                'MONGODB_URI is not defined. Please create a .env file with MONGODB_URI variable.\n' +
                'Example: MONGODB_URI=mongodb://localhost:27017/farmsetu'
            );
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
