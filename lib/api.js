// Replace direct MongoDB calls with API route calls

// Fetch user's bots
export async function fetchUserBots(userId) {
	const response = await fetch("/api/bots/user");
	if (!response.ok) {
		throw new Error("Failed to fetch user bots");
	}
	return await response.json();
}

// Fetch public bots
export async function fetchPublicBots() {
	const response = await fetch("/api/bots/public");
	if (!response.ok) {
		throw new Error("Failed to fetch public bots");
	}
	return await response.json();
}

// Get bot by ID
export async function getBotById(id) {
	const response = await fetch(`/api/bots/${id}`);
	if (response.status === 404) return null;
	if (!response.ok) {
		throw new Error("Failed to fetch bot details");
	}
	return await response.json();
}

// Create a new bot
export async function createBot(botData) {
	const response = await fetch("/api/bots", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(botData),
	});
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to create bot");
	}
	return await response.json();
}

// Update bot
export async function updateBot(id, updates) {
	const response = await fetch(`/api/bots/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updates),
	});
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to update bot");
	}
	return await response.json();
}

// Delete bot
export async function deleteBot(id) {
	const response = await fetch(`/api/bots/${id}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to delete bot");
	}
	return await response.json();
}
