"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
	GitPullRequest,
	GitMerge,
	MessageSquare,
	X,
	Loader2,
	AlertCircle,
} from "lucide-react";

export function PullRequestList({ botId }) {
	const router = useRouter();
	const { toast } = useToast();
	const [pullRequests, setPullRequests] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPullRequests = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(`/api/bots/${botId}/prs`);
				if (!response.ok) throw new Error("Failed to load pull requests");

				const data = await response.json();
				setPullRequests(data);
			} catch (error) {
				console.error("Error fetching pull requests:", error);
				setError("Failed to load pull requests. Please try again.");
				toast({
					title: "Error",
					description: "Failed to load pull requests",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		if (botId) {
			fetchPullRequests();
		}
	}, [botId, toast]);

	if (isLoading) {
		return (
			<Card className="w-full">
				<CardContent className="p-6">
					<div className="flex justify-center items-center h-[200px]">
						<div className="flex flex-col items-center">
							<Loader2 className="h-8 w-8 animate-spin mb-2" />
							<p className="text-muted-foreground">Loading pull requests...</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="w-full">
				<CardContent className="p-6 text-center">
					<AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
					<h3 className="text-lg font-medium mb-2">
						Failed to load pull requests
					</h3>
					<p className="text-muted-foreground mb-4">{error}</p>
					<Button onClick={() => router.reload()}>Try Again</Button>
				</CardContent>
			</Card>
		);
	}

	if (pullRequests.length === 0) {
		return (
			<Card className="w-full">
				<CardContent className="p-6 text-center">
					<GitPullRequest className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
					<h3 className="text-lg font-medium mb-2">No pull requests found</h3>
					<p className="text-muted-foreground mb-4">
						There are no pull requests for this bot yet.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{pullRequests.map((pr) => (
				<Card
					key={pr._id}
					className="hover:bg-muted/40 transition-colors cursor-pointer"
					onClick={() => router.push(`/bots/${botId}/prs/${pr._id}`)}
				>
					<CardContent className="p-4">
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-3">
								<div className="pt-1">
									{pr.status === "open" ? (
										<GitPullRequest className="h-5 w-5 text-primary" />
									) : pr.status === "completed" ? (
										<GitMerge className="h-5 w-5 text-green-500" />
									) : (
										<X className="h-5 w-5 text-destructive" />
									)}
								</div>
								<div>
									<h3 className="font-medium">{pr.title}</h3>
									<div className="text-sm text-muted-foreground mt-1">
										<span>
											#{pr._id.toString().substring(0, 6)} opened{" "}
											{formatDistanceToNow(new Date(pr.createdAt), {
												addSuffix: true,
											})}{" "}
											by {pr.creator?.name || "Unknown"}
										</span>
									</div>
									<div className="flex items-center gap-2 mt-2">
										{pr.status === "open" ? (
											<Badge variant="outline" className="text-primary">
												Open
											</Badge>
										) : pr.status === "completed" ? (
											<Badge variant="outline" className="text-green-500">
												Merged
											</Badge>
										) : (
											<Badge variant="outline" className="text-destructive">
												Closed
											</Badge>
										)}

										{pr.commentCount > 0 && (
											<Badge
												variant="outline"
												className="flex items-center gap-1"
											>
												<MessageSquare className="h-3 w-3" />
												{pr.commentCount}
											</Badge>
										)}

										{pr.unresolvedCommentCount > 0 && (
											<Badge
												variant="outline"
												className="text-amber-500 flex items-center gap-1"
											>
												<AlertCircle className="h-3 w-3" />
												{pr.unresolvedCommentCount} unresolved
											</Badge>
										)}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<div className="text-xs text-right text-muted-foreground">
									{pr.sourceBranch?.name ||
										pr.sourceBranchName ||
										"Deleted branch"}{" "}
									→ {pr.targetBranch?.name || pr.targetBranchName || "Unknown"}
								</div>
								{pr.creator?.image && (
									<Avatar className="h-8 w-8">
										<AvatarImage src={pr.creator.image} />
										<AvatarFallback>
											{pr.creator.name?.[0] || "U"}
										</AvatarFallback>
									</Avatar>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
