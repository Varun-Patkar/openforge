import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * Check if a user has access to a bot
 * @param {string} botId - The bot ID
 * @param {string} userId - The user ID
 * @param {string} requiredPermission - "view", "edit", or "delete"
 * @returns {Promise<boolean>} - Whether the user has access
 */
export async function checkBotAccess(
	botId,
	userId,
	requiredPermission = "view"
) {
	try {
		const client = await clientPromise;
		const db = client.db();

		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(botId),
		});

		if (!bot) return false;

		// Check permissions
		const isOwner = bot.userId.toString() === userId;
		const isCollaborator = bot.collaborators?.some(
			(c) => c.userId.toString() === userId
		);

		// 1. For "delete" permission, only owner can delete
		if (requiredPermission === "delete") {
			return isOwner;
		}

		// 2. For "edit" permission, owner and collaborators can edit
		if (requiredPermission === "edit") {
			return isOwner || isCollaborator;
		}

		// 3. For "view" permission:
		if (requiredPermission === "view") {
			// a. Public bots can be viewed by anyone
			if (bot.visibility === "public") return true;

			// b. Private bots can only be viewed by owner and collaborators
			return isOwner || isCollaborator;
		}

		return false;
	} catch (error) {
		console.error("Error checking bot access:", error);
		return false;
	}
}
