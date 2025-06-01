import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST /api/bots - Create a new bot
export async function POST(request) {
	const session = await getServerSession(authOptions);

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const botData = await request.json();

		// Validate required fields
		if (!botData.name) {
			return new Response(JSON.stringify({ message: "Bot name is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const client = await clientPromise;
		const db = client.db();

		// Create bot
		const newBot = {
			name: botData.name,
			description: botData.description || "",
			visibility: botData.visibility
				? botData.visibility.charAt(0).toUpperCase() +
				  botData.visibility.slice(1)
				: "Private", // Default to Private
			systemPrompt: botData.systemPrompt || "",
			temperature: botData.temperature || 0.7,
			topP: botData.topP || 0.9,
			contextMessagesCount: botData.contextMessagesCount || 3,
			examples: botData.examples || [],
			userId: new ObjectId(session.user.id),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const botResult = await db.collection("bots").insertOne(newBot);
		const botId = botResult.insertedId;

		// Create initial model state object (model.json format)
		const initialModelState = {
			BotName: botData.name,
			Description: botData.description || "",
			Visibility: botData.visibility || "private",
			SystemPrompt: botData.systemPrompt || "",
			DefaultParams: {
				Temperature: botData.temperature || 0.7,
				"Top P": botData.topP || 0.9,
				ContextWindow: botData.contextMessagesCount || 3,
			},
			TestCases: botData.examples
				? botData.examples.map((ex) => ({
						input: ex.input,
						output: ex.expectedOutput,
				  }))
				: [],
		};

		// Create master branch
		const masterBranch = {
			name: "master",
			botId,
			isDefault: true,
			sourceBranchId: null,
			sourceCommitId: null,
			latestCommitId: null, // Will be set after commit creation
			createdBy: new ObjectId(session.user.id),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const branchResult = await db
			.collection("branches")
			.insertOne(masterBranch);

		// Create initial commit
		const initialCommit = {
			botId,
			branchId: branchResult.insertedId,
			message: "Initial commit",
			parentCommitId: null,
			isInitialCommit: true,
			modelState: initialModelState,
			modelDiff: null,
			author: new ObjectId(session.user.id),
			createdAt: new Date(),
		};

		const commitResult = await db
			.collection("commits")
			.insertOne(initialCommit);

		// Update branch with latest commit ID
		await db
			.collection("branches")
			.updateOne(
				{ _id: branchResult.insertedId },
				{ $set: { latestCommitId: commitResult.insertedId } }
			);

		return new Response(
			JSON.stringify({
				...newBot,
				id: botId.toString(),
			}),
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error creating bot:", error);
		return new Response(JSON.stringify({ message: "Failed to create bot" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
