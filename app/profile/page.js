"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function ProfileRedirectPage() {
	const router = useRouter();
	const { status, user } = useAuth();

	useEffect(() => {
		if (status === "authenticated" && user) {
			// Redirect to the dynamic profile page with the user's ID
			router.push(`/profile/${user.id}`);
		} else if (status === "unauthenticated") {
			router.push("/auth");
		}
	}, [status, user, router]);

	return (
		<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
			<div className="text-center">
				<Loader2 className="h-12 w-12 animate-spin mx-auto" />
				<h2 className="mt-4 text-xl font-semibold">Loading your profile...</h2>
			</div>
		</div>
	);
}
