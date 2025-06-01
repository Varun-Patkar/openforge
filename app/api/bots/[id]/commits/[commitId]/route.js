import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/bots/[id]/commits/[commitId] - Get a specific commit
export async function GET(request, { params }) {
	const { id: botId, commitId } = params;
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

		const commit = await db.collection("commits").findOne({
			_id: new ObjectId(commitId),
			botId: new ObjectId(botId),
		});

		if (!commit) {
			return new Response(JSON.stringify({ message: "Commit not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Get the complete model state for this commit
		let modelState;
		if (commit.isInitialCommit) {
			modelState = commit.modelState;
		} else {
			// Hydrate model state from diffs
			modelState = await hydrateCommit(db, commit._id);
		}

		// Return the commit with the hydrated model state
		return new Response(
			JSON.stringify({
				...commit,
				hydratedModelState: modelState,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error fetching commit:", error);
		return new Response(JSON.stringify({ message: "Failed to fetch commit" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
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
