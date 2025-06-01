"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PullRequestList } from "@/components/pull-request-list";
import { CreatePRDialog } from "@/components/create-pr-dialog";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, GitPullRequest } from "lucide-react";

export default function PRsPage({ params }) {
	const router = useRouter();
	const { status } = useAuth();
	const { toast } = useToast();
	const botId = params.id;

	const [isLoading, setIsLoading] = useState(true);
	const [bot, setBot] = useState(null);
	const [selectedBranch, setSelectedBranch] = useState(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
			return;
		}

		const loadBot = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`/api/bots/${botId}`);
				if (response.ok) {
					const data = await response.json();
					setBot(data);

					// Also fetch the default branch
					const branchesResponse = await fetch(`/api/bots/${botId}/branches`);
					if (branchesResponse.ok) {
						const branches = await branchesResponse.json();
						const defaultBranch = branches.find((b) => b.isDefault);
						if (defaultBranch) {
							setSelectedBranch(defaultBranch);
						}
					}
				} else {
					throw new Error("Failed to load bot");
				}
			} catch (error) {
				console.error("Error loading bot:", error);
				toast({
					title: "Error",
					description: "Failed to load bot details",
					variant: "destructive",
				});
				router.push("/dashboard");
			} finally {
				setIsLoading(false);
			}
		};

		if (botId) {
			loadBot();
		}
	}, [botId, status, router, toast]);

	if (isLoading) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<h2 className="mt-4 text-xl font-semibold">
						Loading pull requests...
					</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="container px-4 py-8 mx-auto max-w-[95%]">
			<div className="mb-8">
				<Button
					variant="ghost"
					className="gap-1 mb-4"
					onClick={() => router.push(`/bots/${botId}`)}
				>
					<ArrowLeft className="h-4 w-4" /> Back to Bot
				</Button>

				<div className="flex justify-between items-center mb-4">
					<h1 className="text-3xl font-bold">Pull Requests</h1>

					{/* Add Create PR button here */}
					<CreatePRDialog
						botId={botId}
						currentBranch={selectedBranch}
						trigger={
							<Button className="gap-2">
								<GitPullRequest className="h-4 w-4" />
								Create Pull Request
							</Button>
						}
					/>
				</div>

				<p className="text-muted-foreground">
					{bot?.name
						? `Manage pull requests for ${bot.name}`
						: "Manage pull requests"}
				</p>
			</div>

			<PullRequestList botId={botId} />
		</div>
	);
}
