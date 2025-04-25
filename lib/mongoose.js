import mongoose from "mongoose";

export default async function mongooseConnection() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise();
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MongoDB URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(uri, {
      dbName: "<your-db-name>", // Optional but recommended
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Add event listeners after defining the function
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", async () => {
  console.warn("MongoDB connection lost. Reconnecting...");
  await mongooseConnection(); // Ensure the function is properly awaited
});
