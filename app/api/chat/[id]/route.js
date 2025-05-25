import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper to validate ObjectId
function isValidObjectId(id) {
	try {
		new ObjectId(id);
		return true;
	} catch (error) {
		return false;
	}
}

// GET /api/chat/[id] - Get a specific chat
export async function GET(request, { params }) {
	const session = await getServerSession(authOptions);
	const chatId = params.id;

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Validate chat ID
	if (!isValidObjectId(chatId)) {
		return new Response(JSON.stringify({ message: "Invalid chat ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();

		const chat = await db.collection("chats").findOne({
			_id: new ObjectId(chatId),
			userId: new ObjectId(session.user.id), // Ensure user owns the chat
		});

		if (!chat) {
			return new Response(
				JSON.stringify({ message: "Chat not found or access denied" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Get bot details
		const bot = await db.collection("bots").findOne({
			_id: chat.botId,
		});

		const formattedChat = {
			id: chat._id.toString(),
			title: chat.title,
			botId: chat.botId.toString(),
			userId: chat.userId.toString(),
			messages: chat.messages || [],
			createdAt: chat.createdAt,
			updatedAt: chat.updatedAt,
			bot: bot
				? {
						id: bot._id.toString(),
						name: bot.name,
						description: bot.description,
						systemPrompt: bot.systemPrompt,
				  }
				: null,
		};

		return new Response(JSON.stringify(formattedChat), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching chat:", error);
		return new Response(
			JSON.stringify({ message: "Failed to fetch chat", error: error.message }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// PUT /api/chat/[id] - Update chat (title or messages)
export async function PUT(request, { params }) {
	const session = await getServerSession(authOptions);
	const chatId = params.id;

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Validate chat ID
	if (!isValidObjectId(chatId)) {
		return new Response(JSON.stringify({ message: "Invalid chat ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const { title, messages } = await request.json();
		const client = await clientPromise;
		const db = client.db();

		// Check if user owns the chat
		const chat = await db.collection("chats").findOne({
			_id: new ObjectId(chatId),
			userId: new ObjectId(session.user.id),
		});

		if (!chat) {
			return new Response(
				JSON.stringify({ message: "Chat not found or access denied" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Build update object with only provided fields
		const updateData = { updatedAt: new Date() };
		if (title !== undefined) updateData.title = title;
		if (messages !== undefined) updateData.messages = messages;

		const result = await db
			.collection("chats")
			.updateOne({ _id: new ObjectId(chatId) }, { $set: updateData });

		return new Response(
			JSON.stringify({
				success: true,
				updated: result.modifiedCount > 0,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error updating chat:", error);
		return new Response(
			JSON.stringify({
				message: "Failed to update chat",
				error: error.message,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// DELETE /api/chat/[id] - Delete a chat
export async function DELETE(request, { params }) {
	const session = await getServerSession(authOptions);
	const chatId = params.id;

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Validate chat ID
	if (!isValidObjectId(chatId)) {
		return new Response(JSON.stringify({ message: "Invalid chat ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();

		// Ensure user owns the chat
		const result = await db.collection("chats").deleteOne({
			_id: new ObjectId(chatId),
			userId: new ObjectId(session.user.id),
		});

		if (result.deletedCount === 0) {
			return new Response(
				JSON.stringify({ message: "Chat not found or access denied" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error deleting chat:", error);
		return new Response(
			JSON.stringify({
				message: "Failed to delete chat",
				error: error.message,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
