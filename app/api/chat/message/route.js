import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST /api/chat/message - Process a message with API-based LLM
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
		const { chatId, message, settings } = await request.json();

		if (!chatId || !message) {
			return new Response(
				JSON.stringify({ message: "Missing required fields" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const client = await clientPromise;
		const db = client.db();

		// Get the chat details
		const chat = await db.collection("chats").findOne({
			_id: new ObjectId(chatId),
			userId: new ObjectId(session.user.id),
		});

		if (!chat) {
			return new Response(
				JSON.stringify({ message: "Chat not found or access denied" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Get the bot details
		const bot = await db.collection("bots").findOne({
			_id: new ObjectId(chat.botId),
		});

		if (!bot) {
			return new Response(JSON.stringify({ message: "Bot not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Get user's active preference
		const user = await db.collection("users").findOne({
			_id: new ObjectId(session.user.id),
		});

		if (!user || !user.activePreference) {
			return new Response(
				JSON.stringify({ message: "No active LLM preference found" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Add the user message to chat
		const userMessage = { role: "user", content: message };
		let updatedMessages = [...(chat.messages || []), userMessage];

		// Save the user message first
		await db.collection("chats").updateOne(
			{ _id: new ObjectId(chatId) },
			{
				$set: {
					messages: updatedMessages,
					updatedAt: new Date(),
				},
			}
		);

		// For WebLLM, just return the message and let client handle it
		if (user.activePreference.type === "webllm") {
			return new Response(
				JSON.stringify({
					message: "WebLLM processing happens client-side",
					userMessage,
					settings: {
						temperature: settings?.temperature || bot.temperature || 0.7,
						topP: settings?.topP || bot.topP || 0.9,
						contextMessagesCount:
							settings?.contextMessagesCount || bot.contextMessagesCount || 3,
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// For API-based LLMs, process on server
		// This is a simplified mockup - in a real app, you'd integrate with actual APIs
		const aiResponse = `This is a mock response to: "${message}"\n\nIn a real implementation, this would connect to the selected LLM API (${
			user.activePreference.provider || "Unknown Provider"
		}).`;

		// Add AI response to messages
		const assistantMessage = { role: "assistant", content: aiResponse };
		updatedMessages = [...updatedMessages, assistantMessage];

		// Update the chat with the new messages
		await db.collection("chats").updateOne(
			{ _id: new ObjectId(chatId) },
			{
				$set: {
					messages: updatedMessages,
					updatedAt: new Date(),
				},
			}
		);

		return new Response(
			JSON.stringify({
				response: aiResponse,
				userMessage,
				assistantMessage,
				chatId,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error processing message:", error);
		return new Response(
			JSON.stringify({
				message: "Failed to process message",
				error: error.message,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
