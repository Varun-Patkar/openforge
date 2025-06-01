import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST /api/bots/[id]/prs/[prId]/comments - Add a comment to a PR
export async function POST(request, { params }) {
	const { id: botId, prId } = params;
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const { content, lineReference } = await request.json();

		if (!content) {
			return new Response(
				JSON.stringify({ message: "Comment content is required" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const client = await clientPromise;
		const db = client.db();

		// Check if PR exists
		const pr = await db.collection("pullRequests").findOne({
			_id: new ObjectId(prId),
			botId: new ObjectId(botId),
		});

		if (!pr) {
			return new Response(
				JSON.stringify({ message: "Pull request not found" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Check if PR is open
		if (pr.status !== "open") {
			return new Response(
				JSON.stringify({ message: "Cannot comment on a closed pull request" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Create the comment
		const newComment = {
			prId: new ObjectId(prId),
			botId: new ObjectId(botId),
			userId: new ObjectId(session.user.id),
			content,
			createdAt: new Date(),
			resolved: false,
		};

		// Add line reference if provided
		if (lineReference) {
			newComment.lineReference = lineReference;
		}

		const result = await db.collection("prComments").insertOne(newComment);

		// Get user info to return with the comment
		const user = await db
			.collection("users")
			.findOne(
				{ _id: new ObjectId(session.user.id) },
				{ projection: { name: 1, image: 1 } }
			);

		return new Response(
			JSON.stringify({
				...newComment,
				_id: result.insertedId,
				user: {
					name: user?.name,
					image: user?.image,
				},
			}),
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error creating comment:", error);
		return new Response(
			JSON.stringify({ message: "Failed to create comment" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// GET /api/bots/[id]/prs/[prId]/comments - Get all comments for a PR
export async function GET(request, { params }) {
	const { id: botId, prId } = params;
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

		// Check if bot exists and user has access
		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
		});

		if (!bot) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Check access rights for private bots
		const isOwner = bot.userId.toString() === session.user.id;
		const isCollaborator = bot.collaborators?.some(
			(c) => c.userId.toString() === session.user.id
		);

		if (bot.visibility !== "Public" && !isOwner && !isCollaborator) {
			return new Response(JSON.stringify({ message: "Unauthorized" }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Get comments with user information
		const comments = await db
			.collection("prComments")
			.aggregate([
				{ $match: { prId: new ObjectId(prId) } },
				{
					$lookup: {
						from: "users",
						localField: "userId",
						foreignField: "_id",
						as: "user",
					},
				},
				{ $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: "users",
						localField: "resolvedBy",
						foreignField: "_id",
						as: "resolvedByUser",
					},
				},
				{
					$unwind: {
						path: "$resolvedByUser",
						preserveNullAndEmptyArrays: true,
					},
				},
				{ $sort: { createdAt: 1 } },
			])
			.toArray();

		return new Response(JSON.stringify(comments), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching PR comments:", error);
		return new Response(
			JSON.stringify({ message: "Failed to fetch PR comments" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
