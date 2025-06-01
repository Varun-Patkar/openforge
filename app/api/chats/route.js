import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function POST(request) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const { botId, title, commitId } = await request.json();

		if (!botId) {
			return new Response(JSON.stringify({ message: "Bot ID is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const client = await clientPromise;
		const db = client.db();

		// Check if bot exists
		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
		});

		if (!bot) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Check access (public bots or user's own bots)
		if (
			bot.visibility !== "public" &&
			bot.userId.toString() !== session.user.id
		) {
			return new Response(JSON.stringify({ message: "Unauthorized" }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Create the chat
		const newChat = {
			botId: new ObjectId(botId),
			userId: new ObjectId(session.user.id),
			title: title || `Chat with ${bot.name}`,
			messages: [],
			commitId: commitId ? new ObjectId(commitId) : null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await db.collection("chats").insertOne(newChat);

		return new Response(
			JSON.stringify({
				id: result.insertedId,
				...newChat,
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
