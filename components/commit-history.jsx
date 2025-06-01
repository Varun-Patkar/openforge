"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitCommit, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function CommitHistory({
	botId,
	branch,
	selectedCommit,
	onCommitSelect,
}) {
	const [commits, setCommits] = useState([]);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		const fetchCommits = async () => {
			if (!branch || !branch._id) {
				setCommits([]);
				return;
			}

			setLoading(true);

			try {
				const url = `/api/bots/${botId}/commits?branchId=${branch._id}`;
				const response = await fetch(url);

				if (!response.ok) {
					throw new Error("Failed to fetch commits");
				}

				const data = await response.json();
				setCommits(data);
			} catch (error) {
				console.error("Error fetching commits:", error);
				toast({
					title: "Error",
					description: "Failed to load commit history",
					variant: "destructive",
				});
				setCommits([]);
			} finally {
				setLoading(false);
			}
		};

		fetchCommits();
	}, [botId, branch, toast]);

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<GitCommit className="h-5 w-5" />
					Commit History
					{branch && (
						<span className="text-sm font-normal">({branch.name})</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : commits.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-muted-foreground">
							No commits found for this branch.
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							Changes need to be committed to appear here.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{commits.map((commit) => (
							<div
								key={commit._id}
								className={`border rounded-md p-3 cursor-pointer transition-colors ${
									selectedCommit?._id === commit._id
										? "bg-muted border-primary"
										: "hover:bg-muted/50"
								}`}
								onClick={() => onCommitSelect(commit)}
							>
								<div className="flex items-start justify-between gap-4">
									<div>
										<h4 className="font-medium truncate">{commit.message}</h4>
										<div className="text-sm text-muted-foreground mt-1">
											<span className="font-mono">
												{commit._id.substring(0, 8)}
											</span>
											{commit.isInitialCommit && (
												<span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
													Initial
												</span>
											)}
										</div>
									</div>
									<div className="text-xs text-right text-muted-foreground">
										{commit.createdAt &&
											format(new Date(commit.createdAt), "MMM d, yyyy")}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
