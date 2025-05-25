import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper function to check if string is valid ObjectId
function isValidObjectId(id) {
	try {
		new ObjectId(id);
		return true;
	} catch (error) {
		return false;
	}
}

// GET /api/bots/[id] - Get a bot by ID
export async function GET(request, { params }) {
	const botId = params.id;

	// Validate ID format
	if (!isValidObjectId(botId)) {
		return new Response(JSON.stringify({ message: "Invalid bot ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();

		const bot = await db
			.collection("bots")
			.findOne({ _id: new ObjectId(botId) });

		if (!bot) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// For private bots, check if the current user is the owner
		if (bot.visibility === "private") {
			const session = await getServerSession(authOptions);
			if (
				!session ||
				!session.user ||
				session.user.id !== bot.userId.toString()
			) {
				return new Response(
					JSON.stringify({ message: "Unauthorized to view this bot" }),
					{
						status: 403,
						headers: { "Content-Type": "application/json" },
					}
				);
			}
		}

		return new Response(
			JSON.stringify({
				...bot,
				_id: bot._id.toString(),
				id: bot._id.toString(),
				userId: bot.userId.toString(),
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error fetching bot:", error);
		return new Response(JSON.stringify({ message: "Failed to fetch bot" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

// PUT /api/bots/[id] - Update a bot
export async function PUT(request, { params }) {
	const session = await getServerSession(authOptions);
	const botId = params.id;

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Validate ID format
	if (!isValidObjectId(botId)) {
		return new Response(JSON.stringify({ message: "Invalid bot ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const updates = await request.json();
		const client = await clientPromise;
		const db = client.db();

		// First check if user owns this bot
		const existingBot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
		});

		if (!existingBot) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (existingBot.userId.toString() !== session.user.id) {
			return new Response(
				JSON.stringify({
					message: "You don't have permission to update this bot",
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Add updated timestamp
		updates.updatedAt = new Date();

		await db
			.collection("bots")
			.updateOne({ _id: new ObjectId(botId) }, { $set: updates });

		const updatedBot = await db
			.collection("bots")
			.findOne({ _id: new ObjectId(botId) });

		return new Response(
			JSON.stringify({
				...updatedBot,
				_id: updatedBot._id.toString(),
				id: updatedBot._id.toString(),
				userId: updatedBot.userId.toString(),
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error updating bot:", error);
		return new Response(JSON.stringify({ message: "Failed to update bot" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

// DELETE /api/bots/[id] - Delete a bot
export async function DELETE(request, { params }) {
	const session = await getServerSession(authOptions);
	const botId = params.id;

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Validate ID format
	if (!isValidObjectId(botId)) {
		return new Response(JSON.stringify({ message: "Invalid bot ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();

		// First, check if the user is authorized to delete this bot
		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
			userId: new ObjectId(session.user.id),
		});

		if (!bot) {
			return new Response(
				JSON.stringify({
					message: "Bot not found or you don't have permission to delete it",
				}),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Delete all chats related to this bot first
		await db.collection("chats").deleteMany({
			botId: new ObjectId(botId),
		});

		// Then delete the bot itself
		await db.collection("bots").deleteOne({ _id: new ObjectId(botId) });

		return new Response(
			JSON.stringify({ id: botId, message: "Bot deleted successfully" }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error deleting bot:", error);
		return new Response(JSON.stringify({ message: "Failed to delete bot" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
