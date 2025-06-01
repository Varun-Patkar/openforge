import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import JSZip from "jszip";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request, { params }) {
	const { id: botId } = params;
	const { searchParams } = new URL(request.url);
	const branchId = searchParams.get("branchId");
	const commitId = searchParams.get("commitId");

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

		// Verify bot exists and user has access
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

		// Get model state from either commit or branch
		let modelState = null;
		let targetCommitId = null;
		let fileName = bot.name
			? `${bot.name.replace(/[^a-z0-9]/gi, "_")}_model`
			: "model";

		if (commitId) {
			// Get model state from specific commit
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

			targetCommitId = commit._id;
			fileName += `_commit_${commit._id.toString().substring(0, 8)}`;

			// Get full model state
			if (commit.isInitialCommit) {
				modelState = commit.modelState;
			} else {
				modelState = await hydrateCommit(db, commit._id);
			}
		} else if (branchId) {
			// Get model state from latest commit in branch
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

			if (!branch.latestCommitId) {
				return new Response(
					JSON.stringify({ message: "Branch has no commits" }),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			const latestCommit = await db.collection("commits").findOne({
				_id: branch.latestCommitId,
			});

			if (!latestCommit) {
				return new Response(
					JSON.stringify({ message: "Latest commit not found" }),
					{
						status: 404,
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			targetCommitId = latestCommit._id;
			fileName += `_${branch.name.replace(/[^a-z0-9]/gi, "_")}`;

			// Get full model state
			if (latestCommit.isInitialCommit) {
				modelState = latestCommit.modelState;
			} else {
				modelState = await hydrateCommit(db, latestCommit._id);
			}
		} else {
			// No commit or branch specified - use default branch
			const defaultBranch = await db.collection("branches").findOne({
				botId: new ObjectId(botId),
				isDefault: true,
			});

			if (!defaultBranch || !defaultBranch.latestCommitId) {
				return new Response(
					JSON.stringify({ message: "No default branch or commits found" }),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			const latestCommit = await db.collection("commits").findOne({
				_id: defaultBranch.latestCommitId,
			});

			targetCommitId = latestCommit._id;
			fileName += `_${defaultBranch.name.replace(/[^a-z0-9]/gi, "_")}`;

			// Get full model state
			if (latestCommit.isInitialCommit) {
				modelState = latestCommit.modelState;
			} else {
				modelState = await hydrateCommit(db, latestCommit._id);
			}
		}

		if (!modelState) {
			return new Response(
				JSON.stringify({ message: "Could not retrieve model state" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Create a zip file
		const zip = new JSZip();

		// Add model.json with the retrieved model state
		zip.file("model.json", JSON.stringify(modelState, null, 2));

		// Add index.html (template file for local chat)
		const indexHtmlPath = path.join(process.cwd(), "public", "index.html");
		const indexHtmlContent = await fs.readFile(indexHtmlPath, "utf-8");
		zip.file("index.html", indexHtmlContent);

		// Generate zip file
		const zipContent = await zip.generateAsync({ type: "nodebuffer" });

		// Return the zip file for download
		return new Response(zipContent, {
			status: 200,
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": `attachment; filename="${fileName}.zip"`,
			},
		});
	} catch (error) {
		console.error("Error generating model download:", error);
		return new Response(
			JSON.stringify({
				message: "Failed to generate download",
				error: error.message,
			}),
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
