import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/chat - Get all chats for the current user
export async function GET(request) {
	const session = await getServerSession(authOptions);

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();

		const chats = await db
			.collection("chats")
			.find({ userId: new ObjectId(session.user.id) })
			.sort({ updatedAt: -1 })
			.toArray();

		const formattedChats = chats.map((chat) => ({
			...chat,
			id: chat._id.toString(),
			_id: chat._id.toString(),
			userId: chat.userId.toString(),
			botId: chat.botId.toString(),
		}));

		return new Response(JSON.stringify(formattedChats), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching chats:", error);
		return new Response(JSON.stringify({ message: "Failed to fetch chats" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
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

		if (!botId) {
			return new Response(JSON.stringify({ message: "Bot ID is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const client = await clientPromise;
		const db = client.db();

		// Create new chat
		const newChat = {
			userId: new ObjectId(session.user.id),
			botId: new ObjectId(botId),
			title: title || "New Chat",
			messages: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await db.collection("chats").insertOne(newChat);

		return new Response(
			JSON.stringify({
				...newChat,
				id: result.insertedId.toString(),
				_id: result.insertedId.toString(),
				userId: newChat.userId.toString(),
				botId: newChat.botId.toString(),
			}),
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error creating chat:", error);
		return new Response(JSON.stringify({ message: "Failed to create chat" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
