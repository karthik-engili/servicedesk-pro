import mongoose from "mongoose";

const connectionStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export const getDbStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    code: stateCode,
    status: connectionStates[stateCode] || "unknown",
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MongoDB configuration error: MONGODB_URI environment variable is missing.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost. Reconnecting...");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});

export default connectDB;