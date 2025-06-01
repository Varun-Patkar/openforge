import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createPatch } from "rfc6902"; // For JSON Patch format

// GET /api/bots/[id]/commits - Get commits for a bot (optionally filtered by branch)
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
		const { searchParams } = new URL(request.url);
		const branchId = searchParams.get("branchId");

		const client = await clientPromise;
		const db = client.db();

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

		// If no branchId is provided, return all commits for this bot
		if (!branchId) {
			const commits = await db
				.collection("commits")
				.find({ botId: new ObjectId(botId) })
				.sort({ createdAt: -1 })
				.toArray();

			return new Response(JSON.stringify(commits), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		// If branchId is provided, we need to get all commits for this branch
		// including commits from source branches it inherits from
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

		// Build a query that includes:
		// 1. All commits directly made to this branch
		// 2. All commits from the baseCommitIds array (ancestor commits)
		const commitQuery = {
			botId: new ObjectId(botId),
			$or: [
				{ branchId: new ObjectId(branchId) }, // Commits directly on this branch
			],
		};

		// Add ancestor commits to the query if they exist
		if (branch.baseCommitIds && branch.baseCommitIds.length > 0) {
			commitQuery.$or.push({
				_id: { $in: branch.baseCommitIds.map((id) => new ObjectId(id)) },
			});
		}

		// Find all the relevant commits
		const commits = await db
			.collection("commits")
			.find(commitQuery)
			.sort({ createdAt: -1 })
			.toArray();

		return new Response(JSON.stringify(commits), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching commits:", error);
		return new Response(
			JSON.stringify({ message: "Failed to fetch commits" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// POST /api/bots/[id]/commits - Create a new commit
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
		const { branchId, message, modelState } = await request.json();

		if (!branchId || !message || !modelState) {
			return new Response(
				JSON.stringify({
					message: "Branch ID, commit message, and model state are required",
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
				JSON.stringify({ message: "Unauthorized to modify this bot" }),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Get branch
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

		let parentCommitId = null;
		let isInitialCommit = false;
		let modelDiff = null;

		// If branch has a latest commit, use it as parent
		if (branch.latestCommitId) {
			parentCommitId = branch.latestCommitId;

			// Get parent commit to calculate diff
			const parentCommit = await db.collection("commits").findOne({
				_id: parentCommitId,
			});

			// Get complete parent model state
			let parentModelState;
			if (parentCommit.isInitialCommit) {
				parentModelState = parentCommit.modelState;
			} else {
				// Hydrate parent model by applying diffs
				// This would need a recursive function to apply all diffs from initial commit
				// For simplicity, we'll assume we have the complete parent state
				parentModelState = await hydrateCommit(db, parentCommit._id);
			}

			// Calculate diff between parent and current model state
			modelDiff = createPatch(parentModelState, modelState);
		} else {
			// This is the first commit on this branch (and possibly for the bot)
			isInitialCommit = true;
		}

		// Create new commit
		const newCommit = {
			botId: new ObjectId(botId),
			branchId: new ObjectId(branchId),
			message,
			parentCommitId,
			isInitialCommit,
			modelState: isInitialCommit ? modelState : null, // Store full state only for initial commit
			modelDiff: !isInitialCommit ? modelDiff : null, // Store diff for non-initial commits
			author: new ObjectId(session.user.id),
			createdAt: new Date(),
		};

		// After creating the commit and updating the branch with the new latest commit
		const result = await db.collection("commits").insertOne(newCommit);

		// Update branch's latest commit
		await db.collection("branches").updateOne(
			{ _id: new ObjectId(branchId) },
			{
				$set: {
					latestCommitId: result.insertedId,
					updatedAt: new Date(),
				},
			}
		);

		// If this is for the default branch, also update the bot's main fields
		if (branch.isDefault) {
			await db.collection("bots").updateOne(
				{ _id: new ObjectId(botId) },
				{
					$set: {
						name: modelState.BotName,
						description: modelState.Description,
						visibility: modelState.Visibility, // Don't convert to lowercase
						systemPrompt: modelState.SystemPrompt,
						temperature: modelState.DefaultParams.Temperature,
						topP: modelState.DefaultParams["Top P"],
						contextMessagesCount: modelState.DefaultParams.ContextWindow,
						examples: modelState.TestCases.map((tc) => ({
							input: tc.input,
							expectedOutput: tc.output,
						})),
						updatedAt: new Date(),
					},
				}
			);
		}

		return new Response(
			JSON.stringify({
				...newCommit,
				_id: result.insertedId,
			}),
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error creating commit:", error);
		return new Response(
			JSON.stringify({ message: "Failed to create commit" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// Helper function to reconstruct a commit's full model state by applying all diffs
async function hydrateCommit(db, commitId) {
	const commit = await db.collection("commits").findOne({
		_id: new ObjectId(commitId),
	});

	if (!commit) {
		throw new Error("Commit not found");
	}

	// If this is an initial commit, return its full state
	if (commit.isInitialCommit) {
		return commit.modelState;
	}

	// Otherwise, recursively get parent state and apply diff
	const parentState = await hydrateCommit(db, commit.parentCommitId);

	// Apply JSON patch to get current state
	const jsonpatch = require("fast-json-patch");
	return jsonpatch.applyPatch(parentState, commit.modelDiff).newDocument;
}

// Helper function to get the ancestry chain of branches
async function getBranchAncestry(db, branch, ids = []) {
	if (!branch) return ids;

	// Add current branch ID
	ids.push(branch._id);

	// If this branch has a source branch, recursively add its ancestry
	if (branch.sourceBranchId) {
		try {
			const sourceBranch = await db.collection("branches").findOne({
				_id: new ObjectId(branch.sourceBranchId),
			});

			if (sourceBranch) {
				// Recursively get ancestry of source branch
				await getBranchAncestry(db, sourceBranch, ids);
			}
		} catch (error) {
			console.error("Error getting branch ancestry:", error);
		}
	}

	return ids;
}
