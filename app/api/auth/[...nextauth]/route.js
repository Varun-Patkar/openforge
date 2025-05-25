import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
	adapter: MongoDBAdapter(clientPromise),
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
		}),
	],
	pages: {
		signIn: "/auth",
		// signOut: '/auth',
		// error: '/auth/error', // Error code passed in query string as ?error=
		// verifyRequest: '/auth/verify-request', // (used for email/passwordless sign in)
		newUser: "/preferences", // New users will be directed here on first sign in
	},
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async session({ session, token }) {
			// Add user ID from token to session
			if (token && session.user) {
				session.user.id = token.sub; // token.sub is the user's ID from the database (MongoDB _id)
			}
			return session;
		},
		async jwt({ token, user, account, profile, isNewUser }) {
			if (user) {
				token.sub = user.id; // Persist the user's DB ID to the token
			}
			if (isNewUser) {
				// You can perform actions for new users here, e.g., set up default preferences
				// The redirection to /preferences is handled by `pages.newUser`
			}
			return token;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
