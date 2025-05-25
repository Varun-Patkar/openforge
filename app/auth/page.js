"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Github } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function AuthPage() {
	const router = useRouter();
	const { status } = useAuth();
	const [isSigningIn, setIsSigningIn] = useState(false); // Renamed for clarity

	useEffect(() => {
		// If user is already authenticated, redirect them from the auth page.
		// NextAuth's callbackUrl and newUser settings handle post-login redirects.
		if (status === "authenticated") {
			router.push("/preferences"); // Or "/dashboard" if preferred after login
		}
	}, [status, router]);

	const handleGithubSignIn = async () => {
		setIsSigningIn(true);
		// The callbackUrl here tells NextAuth where to go after successful sign-in.
		// If it's a new user, pages.newUser in [...nextauth]/route.js takes precedence.
		await signIn("github", { callbackUrl: "/preferences" }).catch((error) => {
			console.error("GitHub sign-in error:", error);
			setIsSigningIn(false); // Reset loading state on error
		});
		// setIsSigningIn(false) might not be reached if signIn causes a full page redirect.
		// It's mainly for handling errors or if signIn doesn't immediately redirect.
	};

	return (
		<div className="w-full flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl text-center">Welcome</CardTitle>
					<CardDescription className="text-center">
						Sign in to access your LLM dashboard
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-4">
					<Button
						variant="outline"
						onClick={handleGithubSignIn}
						disabled={isSigningIn || status === "loading"} // Disable also if auth status is loading
						className="w-full py-6 text-base flex items-center justify-center space-x-2 group transition-all hover:bg-primary hover:text-primary-foreground"
					>
						<Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
						<span>
							{isSigningIn ? "Authenticating..." : "Continue with GitHub"}
						</span>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
