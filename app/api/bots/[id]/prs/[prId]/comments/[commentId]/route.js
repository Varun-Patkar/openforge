import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PUT /api/bots/[id]/prs/[prId]/comments/[commentId] - Update comment (resolve/unresolve)
export async function PUT(request, { params }) {
	const { id: botId, prId, commentId } = params;
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const { resolved } = await request.json();

		if (resolved === undefined) {
			return new Response(
				JSON.stringify({ message: "Resolved status is required" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
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

		// Check if user is owner or collaborator
		const isOwner = bot.userId.toString() === session.user.id;
		const isCollaborator = bot.collaborators?.some(
			(c) => c.userId.toString() === session.user.id
		);

		if (!isOwner && !isCollaborator) {
			return new Response(
				JSON.stringify({
					message: "Only owners and collaborators can update comments",
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Get the comment
		const comment = await db.collection("prComments").findOne({
			_id: new ObjectId(commentId),
			prId: new ObjectId(prId),
			botId: new ObjectId(botId),
		});

		if (!comment) {
			return new Response(JSON.stringify({ message: "Comment not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Update the comment
		const update = {
			resolved,
			updatedAt: new Date(),
		};

		// If resolving, set resolvedBy
		if (resolved) {
			update.resolvedBy = new ObjectId(session.user.id);
		} else {
			update.resolvedBy = null;
		}

		await db
			.collection("prComments")
			.updateOne({ _id: new ObjectId(commentId) }, { $set: update });

		// Get updated comment with user info
		const updatedComment = await db
			.collection("prComments")
			.aggregate([
				{ $match: { _id: new ObjectId(commentId) } },
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
			])
			.toArray();

		return new Response(JSON.stringify(updatedComment[0]), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error updating PR comment:", error);
		return new Response(
			JSON.stringify({ message: "Failed to update comment" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// DELETE /api/bots/[id]/prs/[prId]/comments/[commentId] - Delete a comment
export async function DELETE(request, { params }) {
	const { id: botId, prId, commentId } = params;
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

		// Get the comment to check ownership
		const comment = await db.collection("prComments").findOne({
			_id: new ObjectId(commentId),
			prId: new ObjectId(prId),
			botId: new ObjectId(botId),
		});

		if (!comment) {
			return new Response(JSON.stringify({ message: "Comment not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Users can only delete their own comments, or bot owners can delete any
		const isOwner = bot.userId.toString() === session.user.id;
		const isCommentAuthor = comment.userId.toString() === session.user.id;

		if (!isOwner && !isCommentAuthor) {
			return new Response(
				JSON.stringify({ message: "You can only delete your own comments" }),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Delete the comment
		await db.collection("prComments").deleteOne({
			_id: new ObjectId(commentId),
		});

		return new Response(
			JSON.stringify({ message: "Comment deleted successfully" }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error deleting PR comment:", error);
		return new Response(
			JSON.stringify({ message: "Failed to delete comment" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
