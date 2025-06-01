"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PullRequestDetail } from "@/components/pull-request-detail";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function PRDetailPage({ params }) {
	const router = useRouter();
	const { status } = useAuth();
	const { toast } = useToast();
	const { id: botId, prId } = params;

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
			return;
		}

		// Just verify the bot exists and user has access
		const verifyAccess = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`/api/bots/${botId}`);
				if (!response.ok) {
					throw new Error("Failed to load bot");
				}
			} catch (error) {
				console.error("Error verifying access:", error);
				toast({
					title: "Error",
					description: "You don't have access to this bot",
					variant: "destructive",
				});
				router.push("/dashboard");
			} finally {
				setIsLoading(false);
			}
		};

		if (botId) {
			verifyAccess();
		}
	}, [botId, prId, status, router, toast]);

	if (isLoading) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<h2 className="mt-4 text-xl font-semibold">
						Loading pull request...
					</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="container px-4 py-8 mx-auto max-w-[95%]">
			<PullRequestDetail botId={botId} prId={prId} />
		</div>
	);
}
