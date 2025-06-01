import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/users/[id] - Get a user by ID
export async function GET(request, { params }) {
	const userId = params.id;

	// Validate ID format
	if (!ObjectId.isValid(userId)) {
		return new Response(JSON.stringify({ message: "Invalid user ID format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const client = await clientPromise;
		const db = client.db();

		// Get user, excluding sensitive information
		const user = await db.collection("users").findOne(
			{ _id: new ObjectId(userId) },
			{
				projection: {
					password: 0,
					// Only include essential fields
					name: 1,
					email: 1,
					image: 1,
					createdAt: 1,
				},
			}
		);

		if (!user) {
			return new Response(JSON.stringify({ message: "User not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Modify some fields before returning
		const session = await getServerSession(authOptions);
		const isOwnProfile = session?.user?.id === user._id.toString();

		return new Response(
			JSON.stringify({
				...user,
				id: user._id.toString(),
				_id: user._id.toString(),
				// Only include email if viewing own profile
				email: isOwnProfile ? user.email : undefined,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error fetching user:", error);
		return new Response(JSON.stringify({ message: "Failed to fetch user" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
