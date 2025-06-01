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

		// Get bot with owner/creator information
		const bot = await db
			.collection("bots")
			.aggregate([
				{ $match: { _id: new ObjectId(botId) } },
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
						systemPrompt: 1,
						temperature: 1,
						topP: 1,
						contextMessagesCount: 1,
						examples: 1,
						userId: 1,
						createdAt: 1,
						updatedAt: 1,
						"creator.name": 1,
						"creator.image": 1,
					},
				},
			])
			.toArray();

		if (!bot || bot.length === 0) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// For private bots, check if the current user is the owner or a collaborator
		if (bot[0].visibility === "private") {
			const session = await getServerSession(authOptions);

			const isOwner = session?.user?.id === bot[0].userId.toString();
			const isCollaborator = bot[0].collaborators?.some(
				(c) => c.userId.toString() === session?.user?.id
			);

			if (!isOwner && !isCollaborator) {
				return new Response(
					JSON.stringify({ message: "Unauthorized to view this bot" }),
					{
						status: 403,
						headers: { "Content-Type": "application/json" },
					}
				);
			}
		}

		// Add isOwner and isCollaborator flags to the response
		const session = await getServerSession(authOptions);
		const isOwner = session?.user?.id === bot[0].userId.toString();
		const isCollaborator = bot[0].collaborators?.some(
			(c) => c.userId.toString() === session?.user?.id
		);

		return new Response(
			JSON.stringify({
				...bot[0],
				_id: bot[0]._id.toString(),
				id: bot[0]._id.toString(),
				userId: bot[0].userId.toString(),
				isOwner,
				isCollaborator,
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
		const client = await clientPromise;
		const db = client.db();

		// Get the bot to check permissions
		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
		});

		if (!bot) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Check if user is owner or collaborator
		const isOwner = bot.userId.toString() === session.user.id;
		const isCollaborator = bot.collaborators?.some(
			(c) => c.userId.toString() === session.user.id
		);

		if (!isOwner && !isCollaborator) {
			return new Response(
				JSON.stringify({ message: "Unauthorized to modify this bot" }),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Continue with the update...
		const updates = await request.json();

		// Reject attempts to change the bot name
		if (updates.name !== undefined) {
			// Option 1: Return an error if name is being changed
			const existingBot = await db.collection("bots").findOne({
				_id: new ObjectId(botId),
			});

			if (existingBot && updates.name !== existingBot.name) {
				return new Response(
					JSON.stringify({
						message: "Bot name cannot be changed after creation",
					}),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			// Option 2: Alternatively, just delete the name property to ignore it
			// delete updates.name;
		}

		// Capitalize visibility first letter if present
		if (updates.visibility) {
			updates.visibility =
				updates.visibility.charAt(0).toUpperCase() +
				updates.visibility.slice(1);
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

		// First, check if the user is authorized to delete this bot (must be owner)
		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
		});

		if (!bot) {
			return new Response(
				JSON.stringify({
					message: "Bot not found",
				}),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Only the owner can delete the bot (not collaborators)
		if (bot.userId.toString() !== session.user.id) {
			return new Response(
				JSON.stringify({
					message: "Only the bot owner can delete it",
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Delete all associated data
		// 1. Delete all chats related to this bot
		await db.collection("chats").deleteMany({
			botId: new ObjectId(botId),
		});

		// 2. Delete all PR comments
		await db.collection("prComments").deleteMany({
			botId: new ObjectId(botId),
		});

		// 3. Delete all pull requests
		await db.collection("pullRequests").deleteMany({
			botId: new ObjectId(botId),
		});

		// 4. Delete all branches
		await db.collection("branches").deleteMany({
			botId: new ObjectId(botId),
		});

		// 5. Delete all commits
		await db.collection("commits").deleteMany({
			botId: new ObjectId(botId),
		});

		// Finally, delete the bot itself
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
