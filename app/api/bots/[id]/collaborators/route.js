import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/bots/[id]/collaborators - Get all collaborators for a bot
export async function GET(request, { params }) {
	const botId = params.id;
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();

		// Get bot with collaborators info
		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
		});

		if (!bot) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Check if user is owner or collaborator (only they can view collaborator info)
		const isOwner = bot.userId.toString() === session.user.id;
		const isCollaborator = bot.collaborators?.some(
			(c) => c.userId.toString() === session.user.id
		);

		if (!isOwner && !isCollaborator && bot.visibility !== "public") {
			return new Response(JSON.stringify({ message: "Unauthorized" }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			});
		}

		const collaborators = bot.collaborators || [];

		return new Response(JSON.stringify(collaborators), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching collaborators:", error);
		return new Response(
			JSON.stringify({ message: "Failed to fetch collaborators" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// POST /api/bots/[id]/collaborators - Add a collaborator to a bot
export async function POST(request, { params }) {
	const botId = params.id;
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const { email } = await request.json();

		if (!email) {
			return new Response(JSON.stringify({ message: "Email is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const client = await clientPromise;
		const db = client.db();

		// Check if bot exists and user is the owner
		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
		});

		if (!bot) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Only bot owner can add collaborators
		if (bot.userId.toString() !== session.user.id) {
			return new Response(
				JSON.stringify({ message: "Only the bot owner can add collaborators" }),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Find user by email
		const collaboratorUser = await db.collection("users").findOne({
			email: email.toLowerCase(),
		});

		if (!collaboratorUser) {
			return new Response(
				JSON.stringify({ message: "User not found with this email" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Check if user is already a collaborator or the owner
		if (collaboratorUser._id.toString() === session.user.id) {
			return new Response(
				JSON.stringify({
					message: "You cannot add yourself as a collaborator",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const existingCollaborators = bot.collaborators || [];
		if (
			existingCollaborators.some(
				(c) => c.userId.toString() === collaboratorUser._id.toString()
			)
		) {
			return new Response(
				JSON.stringify({ message: "User is already a collaborator" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Add collaborator to the bot
		const collaborator = {
			userId: collaboratorUser._id,
			email: collaboratorUser.email,
			name: collaboratorUser.name || "Anonymous User",
			image: collaboratorUser.image || null,
			addedAt: new Date(),
		};

		await db.collection("bots").updateOne(
			{ _id: new ObjectId(botId) },
			{
				$push: { collaborators: collaborator },
				$set: { updatedAt: new Date() },
			}
		);

		return new Response(JSON.stringify(collaborator), {
			status: 201,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error adding collaborator:", error);
		return new Response(
			JSON.stringify({ message: "Failed to add collaborator" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// DELETE /api/bots/[id]/collaborators?userId=[userId] - Remove a collaborator
export async function DELETE(request, { params }) {
	const botId = params.id;
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const { searchParams } = new URL(request.url);
		const collaboratorId = searchParams.get("userId");

		if (!collaboratorId) {
			return new Response(
				JSON.stringify({ message: "Collaborator ID is required" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const client = await clientPromise;
		const db = client.db();

		// Check if bot exists and user is the owner
		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
		});

		if (!bot) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Only bot owner can remove collaborators
		if (bot.userId.toString() !== session.user.id) {
			return new Response(
				JSON.stringify({
					message: "Only the bot owner can remove collaborators",
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Remove collaborator from the bot
		await db.collection("bots").updateOne(
			{ _id: new ObjectId(botId) },
			{
				$pull: { collaborators: { userId: new ObjectId(collaboratorId) } },
				$set: { updatedAt: new Date() },
			}
		);

		return new Response(
			JSON.stringify({ message: "Collaborator removed successfully" }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error removing collaborator:", error);
		return new Response(
			JSON.stringify({ message: "Failed to remove collaborator" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
