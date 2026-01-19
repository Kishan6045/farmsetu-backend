const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        // Extract cluster info from URI for logging (without exposing credentials)
        const uriMatch = process.env.MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):[^@]+@([^/]+)/);
        const clusterInfo = uriMatch ? uriMatch[2] : 'Unknown';

        console.log("🔌 Connecting to MongoDB...");
        console.log("📍 Cluster:", clusterInfo);
        console.log("📦 Target Database: farmsetu");

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "farmsetu",   // 🔥 MOST IMPORTANT LINE - Force database name
        });

        // Verify connection details
        const connectedDB = conn.connection.name;
        const connectedHost = conn.connection.host;

        console.log("✅ MongoDB Connected Successfully!");
        console.log("📊 Connected Database:", connectedDB);
        console.log("🌐 Connected Host:", connectedHost);

        // Safety check - warn if database name doesn't match
        if (connectedDB !== "farmsetu") {
            console.error("⚠️  WARNING: Connected to wrong database!");
            console.error(`   Expected: farmsetu, Got: ${connectedDB}`);
            console.error("   Please check your MONGODB_URI!");
        } else {
            console.log("✅ Database name verified: farmsetu");
        }

    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
