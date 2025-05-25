import clientPromise from "@/lib/mongodb";

// GET /api/bots/public - Get all public bots
export async function GET(request) {
	try {
		const client = await clientPromise;
		const db = client.db();

		const bots = await db
			.collection("bots")
			.find({ visibility: "public" })
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
		console.error("Error fetching public bots:", error);
		return new Response(
			JSON.stringify({ message: "Failed to fetch public bots" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
