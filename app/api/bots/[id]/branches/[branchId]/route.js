import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Function to check if string is valid ObjectId
function isValidObjectId(id) {
	try {
		new ObjectId(id);
		return true;
	} catch (error) {
		return false;
	}
}

// GET /api/bots/[id]/branches/[branchId] - Get a specific branch
export async function GET(request, { params }) {
	const { id: botId, branchId } = params;
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Validate ID formats
	if (!isValidObjectId(botId) || !isValidObjectId(branchId)) {
		return new Response(JSON.stringify({ message: "Invalid ID format" }), {
			status: 400,
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

		const branch = await db.collection("branches").findOne({
			_id: new ObjectId(branchId),
			botId: new ObjectId(botId),
		});

		if (!branch) {
			return new Response(JSON.stringify({ message: "Branch not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response(JSON.stringify(branch), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching branch:", error);
		return new Response(JSON.stringify({ message: "Failed to fetch branch" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

// DELETE /api/bots/[id]/branches/[branchId] - Delete a branch
export async function DELETE(request, { params }) {
	const { id: botId, branchId } = params;
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Validate ID formats
	if (!isValidObjectId(botId) || !isValidObjectId(branchId)) {
		return new Response(JSON.stringify({ message: "Invalid ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
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

		if (bot.userId.toString() !== session.user.id) {
			return new Response(
				JSON.stringify({ message: "Only the bot owner can delete branches" }),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Check if the branch exists
		const branch = await db.collection("branches").findOne({
			_id: new ObjectId(branchId),
			botId: new ObjectId(botId),
		});

		if (!branch) {
			return new Response(JSON.stringify({ message: "Branch not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Don't allow deletion of default branch
		if (branch.isDefault) {
			return new Response(
				JSON.stringify({ message: "Cannot delete the default branch" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Get any child branches that use this branch as their source
		const childBranches = await db
			.collection("branches")
			.find({ sourceBranchId: new ObjectId(branchId) })
			.toArray();

		// For each child branch, update their sourceBranchId to this branch's parent
		// This preserves the chain when intermediate branches are deleted
		if (childBranches.length > 0) {
			const updatePromises = childBranches.map(async (childBranch) => {
				// Update source to grandparent (or null if no grandparent)
				await db.collection("branches").updateOne(
					{ _id: childBranch._id },
					{
						$set: {
							sourceBranchId: branch.sourceBranchId || null,
							// Don't change baseCommitIds as they maintain the full history
						},
					}
				);
			});

			await Promise.all(updatePromises);
		}

		// Get commits that are specific to this branch
		const branchSpecificCommits = await db
			.collection("commits")
			.find({
				branchId: new ObjectId(branchId),
				// Exclude commits that other branches depend on
				_id: {
					$nin: await db.collection("branches").distinct("baseCommitIds", {
						_id: { $ne: new ObjectId(branchId) },
					}),
				},
			})
			.toArray();

		// Only delete commits that are specific to this branch and not referenced by others
		if (branchSpecificCommits.length > 0) {
			await db.collection("commits").deleteMany({
				_id: { $in: branchSpecificCommits.map((commit) => commit._id) },
			});
		}

		// Delete the branch
		await db.collection("branches").deleteOne({
			_id: new ObjectId(branchId),
		});

		return new Response(
			JSON.stringify({ message: "Branch deleted successfully" }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error deleting branch:", error);
		return new Response(
			JSON.stringify({ message: "Failed to delete branch" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
