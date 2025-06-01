import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST /api/bots/[id]/prs - Create a new pull request
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
		const { sourceBranchId, targetBranchId, title, description } =
			await request.json();

		if (!sourceBranchId || !targetBranchId || !title) {
			return new Response(
				JSON.stringify({
					message: "Source branch, target branch, and title are required",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

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

		// Check if user is owner or collaborator
		const isOwner = bot.userId.toString() === session.user.id;
		const isCollaborator = bot.collaborators?.some(
			(c) => c.userId.toString() === session.user.id
		);

		if (!isOwner && !isCollaborator) {
			return new Response(
				JSON.stringify({ message: "Unauthorized to create pull requests" }),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Get source and target branches
		const [sourceBranch, targetBranch] = await Promise.all([
			db.collection("branches").findOne({
				_id: new ObjectId(sourceBranchId),
				botId: new ObjectId(botId),
			}),
			db.collection("branches").findOne({
				_id: new ObjectId(targetBranchId),
				botId: new ObjectId(botId),
			}),
		]);

		if (!sourceBranch) {
			return new Response(
				JSON.stringify({ message: "Source branch not found" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		if (!targetBranch) {
			return new Response(
				JSON.stringify({ message: "Target branch not found" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Prevent creating a PR if source branch is behind target branch
		// Need to check branch lineage to determine which is "newer"
		const sourceCommit = await db.collection("commits").findOne({
			_id: sourceBranch.latestCommitId,
		});

		const targetCommit = await db.collection("commits").findOne({
			_id: targetBranch.latestCommitId,
		});

		// If source branch's base includes the target's latest commit, target is ahead
		if (
			sourceBranch.baseCommitIds?.includes(
				targetBranch.latestCommitId.toString()
			)
		) {
			return new Response(
				JSON.stringify({
					message:
						"Source branch is behind target branch. Pull from target branch first or choose a newer source branch.",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Check if there's already an open PR between these branches
		const existingPR = await db.collection("pullRequests").findOne({
			botId: new ObjectId(botId),
			sourceBranchId: new ObjectId(sourceBranchId),
			targetBranchId: new ObjectId(targetBranchId),
			status: "open",
		});

		if (existingPR) {
			return new Response(
				JSON.stringify({
					message: "An open pull request already exists between these branches",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Create the pull request
		const newPR = {
			botId: new ObjectId(botId),
			title,
			description: description || "",
			sourceBranchId: new ObjectId(sourceBranchId),
			targetBranchId: new ObjectId(targetBranchId),
			creatorId: new ObjectId(session.user.id),
			status: "open",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await db.collection("pullRequests").insertOne(newPR);

		// Compute the diff between branches and store it
		const diff = await computeDiffBetweenBranches(
			db,
			sourceBranch,
			targetBranch
		);

		return new Response(
			JSON.stringify({
				...newPR,
				_id: result.insertedId,
				diff,
			}),
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error creating pull request:", error);
		return new Response(
			JSON.stringify({ message: "Failed to create pull request" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// Helper function to compute diff between branches
async function computeDiffBetweenBranches(db, sourceBranch, targetBranch) {
	// Get the latest commit from each branch
	const sourceCommit = await db.collection("commits").findOne({
		_id: sourceBranch.latestCommitId,
	});

	const targetCommit = await db.collection("commits").findOne({
		_id: targetBranch.latestCommitId,
	});

	// Get the full model state for both commits
	const sourceModelState = sourceCommit.isInitialCommit
		? sourceCommit.modelState
		: await hydrateCommit(db, sourceCommit._id);

	const targetModelState = targetCommit.isInitialCommit
		? targetCommit.modelState
		: await hydrateCommit(db, targetCommit._id);

	// Generate line-by-line diff
	return generateLineDiff(sourceModelState, targetModelState);
}

// Helper function to reconstruct a commit's full model state
async function hydrateCommit(db, commitId) {
	// ...existing hydration code...
}

// Generate line-by-line diff between two JSON objects
function generateLineDiff(sourceState, targetState) {
	// ...existing diff generation code...
}

// GET /api/bots/[id]/prs - Get all PRs for a bot
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

		// Check access rights
		const isOwner = bot.userId.toString() === session.user.id;
		const isCollaborator = bot.collaborators?.some(
			(c) => c.userId.toString() === session.user.id
		);

		// For private bots, only owners and collaborators can see PRs
		if (bot.visibility !== "Public" && !isOwner && !isCollaborator) {
			return new Response(JSON.stringify({ message: "Unauthorized" }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Fetch PRs with user details for creator
		const pullRequests = await db
			.collection("pullRequests")
			.aggregate([
				{ $match: { botId: new ObjectId(botId) } },
				{
					$lookup: {
						from: "users",
						localField: "createdBy",
						foreignField: "_id",
						as: "creator",
					},
				},
				{ $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: "branches",
						localField: "sourceBranchId",
						foreignField: "_id",
						as: "sourceBranch",
					},
				},
				{
					$unwind: { path: "$sourceBranch", preserveNullAndEmptyArrays: true },
				},
				{
					$lookup: {
						from: "branches",
						localField: "targetBranchId",
						foreignField: "_id",
						as: "targetBranch",
					},
				},
				{
					$unwind: { path: "$targetBranch", preserveNullAndEmptyArrays: true },
				},
				// Get comment count for each PR
				{
					$lookup: {
						from: "prComments",
						let: { prId: "$_id" },
						pipeline: [
							{ $match: { $expr: { $eq: ["$prId", "$$prId"] } } },
							{ $count: "total" },
						],
						as: "commentCount",
					},
				},
				{
					$addFields: {
						commentCount: {
							$ifNull: [{ $arrayElemAt: ["$commentCount.total", 0] }, 0],
						},
						unresolvedCommentCount: 0, // Will be calculated in next stage
					},
				},
				// Get unresolved comment count
				{
					$lookup: {
						from: "prComments",
						let: { prId: "$_id" },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $eq: ["$prId", "$$prId"] },
											{ $eq: ["$resolved", false] },
										],
									},
								},
							},
							{ $count: "total" },
						],
						as: "unresolvedCount",
					},
				},
				{
					$addFields: {
						unresolvedCommentCount: {
							$ifNull: [{ $arrayElemAt: ["$unresolvedCount.total", 0] }, 0],
						},
					},
				},
				{ $sort: { createdAt: -1 } },
			])
			.toArray();

		return new Response(JSON.stringify(pullRequests), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching pull requests:", error);
		return new Response(
			JSON.stringify({ message: "Failed to fetch pull requests" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
