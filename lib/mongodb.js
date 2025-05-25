// This is a placeholder for MongoDB Atlas connection
// In a real implementation, this would connect to MongoDB

import { MongoClient } from "mongodb";

let client;
let clientPromise;

// MongoDB URI would come from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
	throw new Error(
		"Please define the MONGODB_URI environment variable inside .env.local or .env.\n" +
			"Ensure the file is in the project root and you have restarted your Next.js development server."
	);
}

if (process.env.NODE_ENV === "development") {
	// In development mode, use a global variable so that the value
	// is preserved across module reloads caused by HMR (Hot Module Replacement).
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, {});
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else {
	// In production mode, it's best to not use a global variable.
	client = new MongoClient(uri, {});
	clientPromise = client.connect();
}

export default clientPromise;
