// Fetch all chats for current user and a specific bot
export async function fetchUserChats(botId) {
	const url = botId ? `/api/chat?botId=${botId}` : "/api/chat";
	try {
		const response = await fetch(url);

		if (!response.ok) {
			// Check if it's a 404, which is acceptable (just means no chats yet)
			if (response.status === 404) {
				return [];
			}

			// Other errors are still thrown
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to fetch chats");
			} else {
				throw new Error(
					`Failed to fetch chats: ${response.status} ${response.statusText}`
				);
			}
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching chats:", error);
		// Return empty array instead of throwing for better UX
		return [];
	}
}

// Fetch a single chat by ID
export async function fetchChat(chatId) {
	if (!chatId) return null;

	const response = await fetch(`/api/chat/${chatId}`);

	if (response.status === 404) return null;

	if (!response.ok) {
		// Check if it's a JSON response (error details)
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch chat");
		} else {
			throw new Error(
				`Failed to fetch chat: ${response.status} ${response.statusText}`
			);
		}
	}

	return await response.json();
}

// Create a new chat
export async function createChat(botId, title, commitId = null) {
	if (!botId) throw new Error("Bot ID is required");

	const response = await fetch("/api/chat", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			botId,
			title: title || new Date().toLocaleString(),
			commitId, // Optional commit ID for version-specific chats
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to create chat");
	}

	return await response.json();
}

// Update messages in a chat
export async function updateMessages(chatId, messages) {
	if (!chatId) throw new Error("Chat ID is required");

	const response = await fetch(`/api/chat/${chatId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ messages }),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to update messages");
	}

	return await response.json();
}

// Rename a chat
export async function renameChat(chatId, title) {
	if (!chatId) throw new Error("Chat ID is required");
	if (!title || !title.trim()) throw new Error("Title cannot be empty");

	const response = await fetch(`/api/chat/${chatId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ title }),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to rename chat");
	}

	return await response.json();
}

// Delete a chat
export async function deleteChat(chatId) {
	if (!chatId) throw new Error("Chat ID is required");

	const response = await fetch(`/api/chat/${chatId}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to delete chat");
	}

	return await response.json();
}

// Send a message and get AI response
export async function sendMessage(chatId, message, settings = {}) {
	try {
		const response = await fetch("/api/chat/message", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				chatId,
				message,
				settings,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to send message");
		}

		return await response.json();
	} catch (error) {
		console.error("Error sending message:", error);
		throw error;
	}
}
