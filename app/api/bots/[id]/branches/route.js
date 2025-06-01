import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { jsonpatch } from "fast-json-patch";

// GET /api/bots/[id]/branches - Get all branches for a bot
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

		const branches = await db
			.collection("branches")
			.find({ botId: new ObjectId(botId) })
			.toArray();

		return new Response(JSON.stringify(branches), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching branches:", error);
		return new Response(
			JSON.stringify({ message: "Failed to fetch branches" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

// POST /api/bots/[id]/branches - Create a new branch
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
		const { name, sourceBranchId } = await request.json();

		if (!name) {
			return new Response(
				JSON.stringify({ message: "Branch name is required" }),
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

		// Check if branch name already exists for this bot
		const existingBranch = await db.collection("branches").findOne({
			botId: new ObjectId(botId),
			name: name,
		});

		if (existingBranch) {
			return new Response(
				JSON.stringify({ message: "Branch name already exists" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Get source branch
		let sourceBranch;
		if (sourceBranchId) {
			sourceBranch = await db.collection("branches").findOne({
				_id: new ObjectId(sourceBranchId),
				botId: new ObjectId(botId),
			});

			if (!sourceBranch) {
				return new Response(
					JSON.stringify({ message: "Source branch not found" }),
					{
						status: 404,
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			// Prevent using master/default branch as a source
			if (sourceBranch.isDefault) {
				return new Response(
					JSON.stringify({
						message:
							"Cannot create branches from the master branch. Please use another branch as source.",
					}),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					}
				);
			}
		} else {
			// Find a non-default branch to use as source
			sourceBranch = await db.collection("branches").findOne({
				botId: new ObjectId(botId),
				isDefault: false,
			});

			// If no non-default branch exists, we need a special case for the first branch
			if (!sourceBranch) {
				// Check if we have a default branch
				const defaultBranch = await db.collection("branches").findOne({
					botId: new ObjectId(botId),
					isDefault: true,
				});

				if (defaultBranch) {
					// If this is the first non-default branch, allow creating from default
					// but warn the user this is a special case
					sourceBranch = defaultBranch;
					console.log(
						"Special case: Creating the first non-default branch from master"
					);
				} else {
					return new Response(
						JSON.stringify({ message: "No source branch found" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						}
					);
				}
			}
		}

		if (!sourceBranch) {
			return new Response(
				JSON.stringify({ message: "No source branch found" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Create new branch
		const newBranch = {
			name,
			botId: new ObjectId(botId),
			isDefault: false,
			sourceBranchId: sourceBranch._id,
			sourceCommitId: sourceBranch.latestCommitId, // Store the commit where this branch starts
			baseCommitIds: [], // We'll populate this with the full ancestry commit chain
			latestCommitId: sourceBranch.latestCommitId, // Start with same commit as source
			createdBy: new ObjectId(session.user.id),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Store the complete ancestry of commit IDs
		// This ensures we maintain proper history even if intermediate branches are deleted
		if (
			sourceBranch.baseCommitIds &&
			Array.isArray(sourceBranch.baseCommitIds)
		) {
			// Copy the ancestor's base commits and add the source branch's latest commit
			newBranch.baseCommitIds = [
				...sourceBranch.baseCommitIds,
				sourceBranch.latestCommitId,
			].filter(Boolean); // Remove any null/undefined values
		} else if (sourceBranch.latestCommitId) {
			// If no baseCommitIds exist yet, start with just the source branch's latest commit
			newBranch.baseCommitIds = [sourceBranch.latestCommitId];
		}

		const result = await db.collection("branches").insertOne(newBranch);

		return new Response(
			JSON.stringify({
				...newBranch,
				_id: result.insertedId,
			}),
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error creating branch:", error);
		return new Response(
			JSON.stringify({ message: "Failed to create branch" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
