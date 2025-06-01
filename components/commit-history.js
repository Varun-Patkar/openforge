"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GitCommit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CommitHistory({
	botId,
	branch,
	selectedCommit,
	onCommitSelect,
}) {
	const [commits, setCommits] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!botId || !branch) return;

		const fetchCommits = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`/api/bots/${botId}/commits?branchId=${branch._id}`
				);
				if (response.ok) {
					const data = await response.json();
					setCommits(data);
				} else {
					console.error("Failed to fetch commits");
				}
			} catch (error) {
				console.error("Error fetching commits:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCommits();
	}, [botId, branch]);

	if (!branch) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Commit History</CardTitle>
				</CardHeader>
				<CardContent className="text-center text-muted-foreground py-6">
					No branch selected
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<GitCommit className="h-5 w-5" /> {branch.name} - Commits
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				{isLoading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex items-start gap-2">
								<Skeleton className="h-8 w-8 rounded-full" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-1/2" />
								</div>
							</div>
						))}
					</div>
				) : commits.length === 0 ? (
					<div className="text-center text-muted-foreground py-6">
						No commits found
					</div>
				) : (
					<ScrollArea className="h-[550px] pr-4">
						<div className="space-y-3">
							{commits.map((commit) => {
								const isSelected =
									selectedCommit && selectedCommit._id === commit._id;
								const createdAt = new Date(commit.createdAt);
								const timeAgo = formatDistanceToNow(createdAt, {
									addSuffix: true,
								});

								return (
									<Button
										key={commit._id}
										variant="ghost"
										className={cn(
											"w-full justify-start p-2 h-auto",
											isSelected &&
												"bg-primary/10 border border-primary text-primary"
										)}
										onClick={() => onCommitSelect(commit)}
									>
										<div className="flex items-start gap-2 w-full text-left">
											<div className="mt-1">
												<GitCommit className="h-4 w-4" />
											</div>
											<div className="space-y-1 flex-1 min-w-0">
												<p className="font-medium line-clamp-2 text-sm">
													{commit.message}
												</p>
												<div className="flex items-center gap-1 text-xs text-muted-foreground">
													<span className="font-mono">
														{commit._id.toString().substring(0, 7)}
													</span>
													<span>•</span>
													<span>{timeAgo}</span>
												</div>

												{commit.authorInfo && (
													<div className="flex items-center text-xs text-muted-foreground mt-1">
														<Link
															href={`/profile/${
																commit.authorInfo._id || commit.author
															}`}
															className="flex items-center hover:text-primary transition-colors"
															onClick={
																(e) => e.stopPropagation() // Prevent trigger parent onClick
															}
														>
															<Avatar className="h-4 w-4 mr-1">
																<AvatarImage
																	src={commit.authorInfo.image}
																	alt={commit.authorInfo.name}
																/>
																<AvatarFallback className="text-[10px]">
																	{commit.authorInfo.name
																		? commit.authorInfo.name
																				.charAt(0)
																				.toUpperCase()
																		: "U"}
																</AvatarFallback>
															</Avatar>
															<span>
																{commit.authorInfo.name || "Anonymous"}
															</span>
														</Link>
													</div>
												)}
											</div>
										</div>
									</Button>
								);
							})}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
