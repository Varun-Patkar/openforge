import clientPromise from "@/lib/mongodb";

// GET /api/bots/public - Get all public bots
export async function GET(request) {
	try {
		const client = await clientPromise;
		const db = client.db();

		// Get public bots with creator information
		const bots = await db
			.collection("bots")
			.aggregate([
				{ $match: { visibility: "public" } },
				{
					$lookup: {
						from: "users",
						localField: "userId",
						foreignField: "_id",
						as: "creator",
					},
				},
				{ $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
				{
					$project: {
						_id: 1,
						name: 1,
						description: 1,
						visibility: 1,
						userId: 1,
						createdAt: 1,
						updatedAt: 1,
						"creator.name": 1,
						"creator.image": 1,
					},
				},
				{ $sort: { createdAt: -1 } },
			])
			.toArray();

		return new Response(JSON.stringify(bots), {
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
