import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/chat - Get all chats for the current user and specific bot
export async function GET(request) {
	const session = await getServerSession(authOptions);

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Get botId from query params
	const url = new URL(request.url);
	const botId = url.searchParams.get("botId");

	// Validate botId if provided
	if (botId && !ObjectId.isValid(botId)) {
		return new Response(JSON.stringify({ message: "Invalid bot ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();

		// Build query - always filter by user ID and optionally by bot ID
		const query = { userId: new ObjectId(session.user.id) };
		if (botId) {
			query.botId = new ObjectId(botId);
		}

		const chats = await db
			.collection("chats")
			.find(query)
			.sort({ updatedAt: -1 })
			.toArray();

		const formattedChats = chats.map((chat) => ({
			id: chat._id.toString(),
			title: chat.title,
			botId: chat.botId.toString(),
			userId: chat.userId.toString(),
			messages: chat.messages || [],
			createdAt: chat.createdAt,
			updatedAt: chat.updatedAt,
		}));

		return new Response(JSON.stringify(formattedChats), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching chats:", error);
		return new Response(
			JSON.stringify({
				message: "Failed to fetch chats",
				error: error.message,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// POST /api/chat - Create a new chat
export async function POST(request) {
	const session = await getServerSession(authOptions);

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const { botId, title } = await request.json();

		if (!botId || !ObjectId.isValid(botId)) {
			return new Response(
				JSON.stringify({ message: "Valid bot ID is required" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const client = await clientPromise;
		const db = client.db();

		// Create new chat
		const newChat = {
			userId: new ObjectId(session.user.id),
			botId: new ObjectId(botId),
			title: title || new Date().toLocaleString(),
			messages: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await db.collection("chats").insertOne(newChat);

		const createdChat = {
			id: result.insertedId.toString(),
			title: newChat.title,
			botId: newChat.botId.toString(),
			userId: newChat.userId.toString(),
			messages: [],
			createdAt: newChat.createdAt,
			updatedAt: newChat.updatedAt,
		};

		return new Response(JSON.stringify(createdChat), {
			status: 201,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error creating chat:", error);
		return new Response(
			JSON.stringify({
				message: "Failed to create chat",
				error: error.message,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
