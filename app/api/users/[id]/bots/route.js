import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/users/[id]/bots - Get bots for a specific user
export async function GET(request, { params }) {
	const userId = params.id;

	// Validate ID format
	if (!ObjectId.isValid(userId)) {
		return new Response(JSON.stringify({ message: "Invalid user ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();
		const session = await getServerSession(authOptions);
		const currentUserId = session?.user?.id;

		// Determine what bots to show:
		// 1. Public bots from the requested user
		// 2. If the current user is viewing their own profile, show all their bots
		// 3. If the current user is a collaborator on private bots from the requested user, show those too

		// Start with basic filter for public bots
		let botsQuery = {
			userId: new ObjectId(userId),
			$or: [{ visibility: "public" }],
		};

		// If viewing own profile, show all bots
		if (currentUserId === userId) {
			// No need for $or with visibility filter if showing all own bots
			botsQuery = { userId: new ObjectId(userId) };
		}
		// Otherwise, if logged in, check for collaborator access
		else if (currentUserId) {
			// Add filter for private bots where current user is a collaborator
			botsQuery.$or.push({
				visibility: "private",
				"collaborators.userId": new ObjectId(currentUserId),
			});
		}

		const bots = await db
			.collection("bots")
			.find(botsQuery)
			.sort({ createdAt: -1 })
			.toArray();

		// Map through bots to:
		// 1. Convert ObjectIds to strings
		// 2. Add isOwner and isCollaborator flags
		// 3. Enhance with user access information
		const formattedBots = bots.map((bot) => {
			const isOwner = currentUserId === bot.userId.toString();
			const isCollaborator = bot.collaborators?.some(
				(c) => c.userId.toString() === currentUserId
			);

			return {
				...bot,
				id: bot._id.toString(),
				_id: bot._id.toString(),
				userId: bot.userId.toString(),
				isPublic: bot.visibility === "public",
				isOwner,
				isCollaborator,
			};
		});

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
