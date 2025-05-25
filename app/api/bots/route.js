import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST /api/bots - Create a new bot
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
		const botData = await request.json();
		const client = await clientPromise;
		const db = client.db();

		// Add user ID to the bot data
		const newBot = {
			...botData,
			userId: new ObjectId(session.user.id),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await db.collection("bots").insertOne(newBot);
		const insertedBot = await db
			.collection("bots")
			.findOne({ _id: result.insertedId });

		return new Response(
			JSON.stringify({
				...insertedBot,
				_id: insertedBot._id.toString(),
				id: insertedBot._id.toString(),
				userId: insertedBot.userId.toString(),
			}),
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error creating bot:", error);
		return new Response(JSON.stringify({ message: "Failed to create bot" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
