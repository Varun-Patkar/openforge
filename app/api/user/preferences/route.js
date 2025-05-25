import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { encrypt, decrypt } from "@/lib/crypto";
import { ObjectId } from "mongodb";

export async function GET(request) {
	// Get the session using the same authOptions from [...nextauth]/route.js
	const session = await getServerSession(authOptions);

	// Check if the user is authenticated
	if (!session || !session.user || !session.user.id) {
		console.log("API: User not authenticated", session?.user?.id);
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();

		// Find the user by their ID
		const userId = session.user.id;
		const user = await db.collection("users").findOne({
			_id: new ObjectId(userId),
		});

		if (!user) {
			return new Response(JSON.stringify({ message: "User not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Decrypt API keys before sending to client
		const apiKeys = (user.apiKeys || []).map((key) => ({
			...key,
			apiKey: decrypt(key.apiKey), // Decrypt API key
		}));

		// Return the user's preferences (if they exist)
		const responseData = {
			apiKeys,
			activePreference: user.activePreference || null,
		};

		return new Response(JSON.stringify(responseData), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching user preferences:", error);
		return new Response(JSON.stringify({ message: "Server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export async function PUT(request) {
	// Get the session using the same authOptions
	const session = await getServerSession(authOptions);

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		// Parse the request body
		const body = await request.json();
		const { apiKeys, activePreference } = body;

		const client = await clientPromise;
		const db = client.db();

		// Encrypt API keys before storing in DB
		const encryptedApiKeys = (apiKeys || []).map((key) => ({
			...key,
			apiKey: encrypt(key.apiKey), // Encrypt API key
		}));

		// Update the user document with new preferences
		const result = await db.collection("users").updateOne(
			{ _id: new ObjectId(session.user.id) },
			{
				$set: {
					apiKeys: encryptedApiKeys,
					activePreference,
				},
			},
			{ upsert: false } // Don't create if user doesn't exist
		);

		if (result.matchedCount === 0) {
			return new Response(JSON.stringify({ message: "User not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error updating user preferences:", error);
		return new Response(JSON.stringify({ message: "Server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
