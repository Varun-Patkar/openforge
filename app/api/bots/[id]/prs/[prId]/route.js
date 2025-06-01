import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createPatch } from "rfc6902"; // For JSON Patch format

// GET /api/bots/[id]/prs/[prId] - Get PR details with comments
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

		// Get PR details with related entities
		const pullRequest = await db
			.collection("pullRequests")
			.aggregate([
				{ $match: { _id: new ObjectId(prId), botId: new ObjectId(botId) } },
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
				// Lookup the merge commit if this PR was completed
				{
					$lookup: {
						from: "commits",
						localField: "mergeCommitId",
						foreignField: "_id",
						as: "mergeCommit",
					},
				},
				{
					$unwind: { path: "$mergeCommit", preserveNullAndEmptyArrays: true },
				},
			])
			.toArray();

		if (!pullRequest || pullRequest.length === 0) {
			return new Response(
				JSON.stringify({ message: "Pull request not found" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Handle case where PR is completed but source branch was deleted
		const prData = pullRequest[0];

		// If PR is completed but source branch is missing, use stored branch names
		if (prData.status === "completed" && !prData.sourceBranch) {
			// Create a placeholder object for the deleted source branch
			prData.sourceBranch = {
				name: prData.sourceBranchName || "Deleted branch",
				_id: prData.sourceBranchId,
				deleted: true,
			};
		}

		// Get comments for this PR regardless of PR status
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

		// Initialize variables for commit references - needed regardless of PR status
		let sourceLatestCommit = null;
		let targetLatestCommit = null;
		let diff = null;

		// If the PR is completed and has a merge commit, get diff from there
		if (prData.status === "completed" && prData.mergeCommit) {
			// Get the merge commit state
			const mergeCommitState =
				prData.mergeCommit.modelState ||
				(await hydrateCommit(db, prData.mergeCommitId));

			// Try to get the target branch state before the merge
			if (prData.targetBranch && prData.targetBranch.latestCommitId) {
				const targetBranchCommit = await db.collection("commits").findOne({
					_id: prData.targetBranch.latestCommitId,
				});

				targetLatestCommit = targetBranchCommit;

				const targetBranchState = targetBranchCommit
					? targetBranchCommit.modelState ||
					  (await hydrateCommit(db, targetBranchCommit._id))
					: null;

				if (mergeCommitState && targetBranchState) {
					diff = createLineDiff(targetBranchState, mergeCommitState);
				}
			}
		} else if (prData.sourceBranch && prData.targetBranch) {
			// For open PRs, get diff between source and target branches

			// Get the latest commit from source branch
			sourceLatestCommit = await db
				.collection("commits")
				.findOne({ _id: prData.sourceBranch.latestCommitId });

			// Get the latest commit from target branch
			targetLatestCommit = await db
				.collection("commits")
				.findOne({ _id: prData.targetBranch.latestCommitId });

			// Get model states to compute diff
			let sourceModelState = null;
			let targetModelState = null;

			if (sourceLatestCommit) {
				sourceModelState = sourceLatestCommit.isInitialCommit
					? sourceLatestCommit.modelState
					: await hydrateCommit(db, sourceLatestCommit._id);
			}

			if (targetLatestCommit) {
				targetModelState = targetLatestCommit.isInitialCommit
					? targetLatestCommit.modelState
					: await hydrateCommit(db, targetLatestCommit._id);
			}

			// Calculate diff between the two model states
			if (sourceModelState && targetModelState) {
				// Create line-by-line diff for the UI
				diff = createLineDiff(targetModelState, sourceModelState);
			}
		}

		// Return comprehensive PR data
		return new Response(
			JSON.stringify({
				pullRequest: prData,
				comments,
				sourceLatestCommit,
				targetLatestCommit,
				diff,
				canMerge:
					prData.status === "open" &&
					comments.every((c) => c.resolved) &&
					isOwner, // Only owner can complete
				isOwner,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error fetching pull request details:", error);
		return new Response(
			JSON.stringify({
				message: "Failed to fetch pull request details",
				error: error.message, // Include the actual error message for debugging
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// PUT /api/bots/[id]/prs/[prId] - Complete/merge a PR
export async function PUT(request, { params }) {
	const { id: botId, prId } = params;
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const { action } = await request.json();

		if (action !== "complete") {
			return new Response(JSON.stringify({ message: "Invalid action" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
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

		// Check if user is owner (only owners can complete PRs)
		const isOwner = bot.userId.toString() === session.user.id;
		if (!isOwner) {
			return new Response(
				JSON.stringify({
					message: "Only bot owners can complete pull requests",
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Get PR details
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

		if (pr.status !== "open") {
			return new Response(
				JSON.stringify({
					message: "This pull request is already closed or completed",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Check if all comments are resolved
		const unresolvedComments = await db
			.collection("prComments")
			.countDocuments({
				prId: new ObjectId(prId),
				resolved: false,
			});

		if (unresolvedComments > 0) {
			return new Response(
				JSON.stringify({
					message:
						"All comments must be resolved before completing the pull request",
					unresolvedCount: unresolvedComments,
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Get source and target branches
		const sourceBranch = await db.collection("branches").findOne({
			_id: pr.sourceBranchId,
		});

		const targetBranch = await db.collection("branches").findOne({
			_id: pr.targetBranchId,
		});

		if (!sourceBranch || !targetBranch) {
			return new Response(
				JSON.stringify({ message: "Source or target branch not found" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Store the branch names before potentially deleting the branch
		const sourceBranchName = sourceBranch.name;
		const targetBranchName = targetBranch.name;

		// Get latest commits from both branches
		const sourceLatestCommit = await db.collection("commits").findOne({
			_id: sourceBranch.latestCommitId,
		});

		// Get hydrated model states
		const sourceModelState = await hydrateCommit(db, sourceLatestCommit._id);

		// Create a new merge commit on the target branch
		const mergeCommit = {
			botId: new ObjectId(botId),
			branchId: targetBranch._id,
			message: `Merge branch '${sourceBranch.name}' into ${targetBranch.name}`,
			parentCommitId: targetBranch.latestCommitId,
			isInitialCommit: false,
			modelState: sourceModelState, // Use the source branch's state
			modelDiff: null, // Will be calculated below
			author: new ObjectId(session.user.id),
			createdAt: new Date(),
			prId: pr._id, // Reference to the PR
		};

		// If target branch has a latest commit, calculate diff
		if (targetBranch.latestCommitId) {
			const targetModelState = await hydrateCommit(
				db,
				targetBranch.latestCommitId
			);
			mergeCommit.modelDiff = createPatch(targetModelState, sourceModelState);
		} else {
			// If target branch has no commits, this is the first one
			mergeCommit.isInitialCommit = true;
		}

		// Create the merge commit
		const commitResult = await db.collection("commits").insertOne(mergeCommit);

		// Update target branch with new latest commit
		await db.collection("branches").updateOne(
			{ _id: targetBranch._id },
			{
				$set: {
					latestCommitId: commitResult.insertedId,
					updatedAt: new Date(),
				},
			}
		);

		// If target is the default branch, update bot with new state
		if (targetBranch.isDefault) {
			await db.collection("bots").updateOne(
				{ _id: new ObjectId(botId) },
				{
					$set: {
						name: sourceModelState.BotName,
						description: sourceModelState.Description,
						visibility: sourceModelState.Visibility,
						systemPrompt: sourceModelState.SystemPrompt,
						temperature: sourceModelState.DefaultParams.Temperature,
						topP: sourceModelState.DefaultParams["Top P"],
						contextMessagesCount: sourceModelState.DefaultParams.ContextWindow,
						examples: sourceModelState.TestCases.map((tc) => ({
							input: tc.input,
							expectedOutput: tc.output,
						})),
						updatedAt: new Date(),
					},
				}
			);
		}

		// Update PR status to completed
		await db.collection("pullRequests").updateOne(
			{ _id: new ObjectId(prId) },
			{
				$set: {
					status: "completed",
					completedAt: new Date(),
					mergeCommitId: commitResult.insertedId,
					// Store branch names even after deletion
					sourceBranchName: sourceBranchName,
					targetBranchName: targetBranchName,
				},
			}
		);

		// Delete the source branch as required
		await db.collection("branches").deleteOne({ _id: sourceBranch._id });

		return new Response(
			JSON.stringify({
				message: "Pull request completed successfully",
				mergeCommitId: commitResult.insertedId.toString(),
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error completing pull request:", error);
		return new Response(
			JSON.stringify({ message: "Failed to complete pull request" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// Helper function to reconstruct a commit's full model state
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

// Helper function to create a line-by-line diff for UI display
function createLineDiff(sourceState, targetState) {
	// Convert states to string for comparison
	const sourceLines = JSON.stringify(sourceState, null, 2).split("\n");
	const targetLines = JSON.stringify(targetState, null, 2).split("\n");

	const diffLines = [];
	let i = 0,
		j = 0;

	// Walk through both versions line by line
	while (i < sourceLines.length || j < targetLines.length) {
		if (
			i < sourceLines.length &&
			j < targetLines.length &&
			sourceLines[i] === targetLines[j]
		) {
			// Unchanged line
			diffLines.push({
				type: "unchanged",
				content: sourceLines[i],
				sourceLineNum: i + 1,
				targetLineNum: j + 1,
			});
			i++;
			j++;
		} else if (
			j < targetLines.length &&
			(i >= sourceLines.length || sourceLines[i] !== targetLines[j])
		) {
			// Added line
			diffLines.push({
				type: "added",
				content: targetLines[j],
				sourceLineNum: null,
				targetLineNum: j + 1,
			});
			j++;
		} else if (i < sourceLines.length) {
			// Removed line
			diffLines.push({
				type: "removed",
				content: sourceLines[i],
				sourceLineNum: i + 1,
				targetLineNum: null,
			});
			i++;
		}
	}

	return diffLines;
}
