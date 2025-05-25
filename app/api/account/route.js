import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// DELETE /api/account - Delete user account and all related data
export async function DELETE(request) {
	const session = await getServerSession(authOptions);

	// Check authentication
	if (!session || !session.user || !session.user.id) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const userId = session.user.id;

	try {
		const client = await clientPromise;
		const db = client.db();

		// Delete all chats created by the user
		await db.collection("chats").deleteMany({
			userId: new ObjectId(userId),
		});

		// Delete all bots created by the user
		await db.collection("bots").deleteMany({
			userId: new ObjectId(userId),
		});

		// Delete user account
		await db.collection("users").deleteOne({
			_id: new ObjectId(userId),
		});

		// Also clean up related collections (sessions, accounts, etc.)
		await db.collection("accounts").deleteMany({
			userId: new ObjectId(userId),
		});

		await db.collection("sessions").deleteMany({
			userId: new ObjectId(userId),
		});

		return new Response(
			JSON.stringify({
				success: true,
				message: "Account and all related data deleted successfully",
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error deleting account:", error);
		return new Response(
			JSON.stringify({
				message: "Failed to delete account",
				error: error.message,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
