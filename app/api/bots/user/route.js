import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/bots/user - Get all bots for the current user
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

		const bots = await db
			.collection("bots")
			.find({ userId: new ObjectId(session.user.id) })
			.sort({ createdAt: -1 })
			.toArray();

		const formattedBots = bots.map((bot) => ({
			...bot,
			_id: bot._id.toString(),
			id: bot._id.toString(),
			userId: bot.userId.toString(),
		}));

		return new Response(JSON.stringify(formattedBots), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching user bots:", error);
		return new Response(
			JSON.stringify({ message: "Failed to fetch user bots" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
