"use client";

import { createContext, useContext } from "react";
import {
	SessionProvider,
	useSession,
	signOut as nextAuthSignOut,
} from "next-auth/react";
import { useRouter } from "next/navigation"; // Keep useRouter if signOut needs it

const AuthContext = createContext(undefined);

// This component will consume the session and provide it to the AuthContext
function AuthConsumer({ children }) {
	const { data: session, status } = useSession();
	const router = useRouter(); // For signOut redirect

	const user = session?.user; // User object from NextAuth session (includes id, name, email, image)

	const signOut = async () => {
		try {
			await nextAuthSignOut({ redirect: false }); // Perform sign out without NextAuth handling redirect
			router.push("/"); // Manually redirect to home page after sign out
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	// The signIn function from next-auth/react should be called directly in components
	// where sign-in is initiated (e.g., AuthPage).
	// So, we don't need to provide a signIn function via this context anymore.

	return (
		<AuthContext.Provider value={{ user, status, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}

// AuthProvider now wraps SessionProvider and AuthConsumer
export function AuthProvider({ children }) {
	return (
		<SessionProvider>
			<AuthConsumer>{children}</AuthConsumer>
		</SessionProvider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
