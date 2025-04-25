const { MongoClient, ServerApiVersion } = require("mongodb");

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true, // Enable TLS
  // Remove or set `false` for production unless absolutely necessary
  tlsAllowInvalidCertificates: process.env.NODE_ENV === "development",
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongoClient) {
    globalThis._mongoClient = new MongoClient(uri, options);
  }
  client = globalThis._mongoClient;
  clientPromise = globalThis._mongoClient.connect();
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

module.exports = clientPromise;
