import mongoose from "mongoose";

// Add event listeners
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost. Reconnecting...");
  mongooseConnection(); // Automatically attempt to reconnect
});

export default async function mongooseConnection() {
  if (mongoose.connection.readyState === 1) {
    // Already connected
    return mongoose.connection.asPromise();
  } else {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    try {
      // Connect to MongoDB
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error; // Re-throw the error after logging it
    }
  }
}
