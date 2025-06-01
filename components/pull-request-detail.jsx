"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	ArrowLeft,
	GitMerge,
	GitPullRequest as PullRequest,
	MessageSquare,
	AlertCircle,
	GitBranch,
	X,
	FileCode,
	Plus,
	Minus,
	Circle,
	CheckCircle,
	Loader2,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function PullRequestDetail({ botId, prId }) {
	const router = useRouter();
	const { toast } = useToast();
	const diffContainerRef = useRef(null);
	const leftSideRef = useRef(null);
	const rightSideRef = useRef(null);

	const [prData, setPrData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [commentText, setCommentText] = useState("");
	const [selectedText, setSelectedText] = useState(null);
	const [isPostingComment, setIsPostingComment] = useState(false);
	const [isMerging, setIsMerging] = useState(false);
	const [showMergeDialog, setShowMergeDialog] = useState(false);
	const [hoveredComment, setHoveredComment] = useState(null);

	// Load PR details
	const loadPrDetails = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/bots/${botId}/prs/${prId}`);
			if (response.ok) {
				const data = await response.json();
				setPrData(data);
			} else {
				throw new Error("Failed to load PR details");
			}
		} catch (error) {
			console.error("Error loading PR details:", error);
			toast({
				title: "Error",
				description: "Failed to load pull request details",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (botId && prId) {
			loadPrDetails();
		}
	}, [botId, prId]);

	// Track text selection in the diff view
	useEffect(() => {
		const handleSelection = () => {
			if (!diffContainerRef.current) return;

			const selection = window.getSelection();
			if (selection.rangeCount === 0 || selection.toString().trim() === "") {
				setSelectedText(null);
				return;
			}

			// Check if selection is within our diff container
			let node = selection.anchorNode;
			let startContainer = null;
			while (node && node !== diffContainerRef.current) {
				// Check if we're in a line element with line number
				if (node.classList && node.classList.contains("diff-line")) {
					startContainer = node;
				}
				node = node.parentNode;
			}

			if (!node || !startContainer) {
				// Selection is outside our diff container
				return;
			}

			// Get line numbers and determine if it's from old or new version
			const isOldVersion = startContainer.closest(".left-side") !== null;
			const lineElement = startContainer.querySelector(".line-number");

			if (lineElement) {
				const lineNumber = parseInt(lineElement.textContent.trim(), 10);

				// For multiple line selections, try to find the end line
				let endLine = lineNumber;
				const endNode = selection.focusNode;
				let currentNode = endNode;

				while (currentNode && currentNode !== diffContainerRef.current) {
					if (
						currentNode.classList &&
						currentNode.classList.contains("diff-line")
					) {
						const endLineElement = currentNode.querySelector(".line-number");
						if (endLineElement) {
							endLine = parseInt(endLineElement.textContent.trim(), 10);
							break;
						}
					}
					currentNode = currentNode.parentNode;
				}

				// Create a reference to the selection
				setSelectedText({
					fileVersion: isOldVersion ? "old" : "new",
					startLine: Math.min(lineNumber, endLine),
					endLine: Math.max(lineNumber, endLine),
				});
			}
		};

		document.addEventListener("selectionchange", handleSelection);
		return () =>
			document.removeEventListener("selectionchange", handleSelection);
	}, []);

	// Handle posting a comment (with line reference data)
	const handlePostComment = async () => {
		if (!commentText.trim()) return;

		setIsPostingComment(true);
		try {
			const payload = {
				content: commentText,
				// Include selection reference if available
				...(selectedText && { lineReference: selectedText }),
			};

			const response = await fetch(`/api/bots/${botId}/prs/${prId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error("Failed to post comment");
			}

			const newComment = await response.json();

			// Update PR data with the new comment
			setPrData((prev) => ({
				...prev,
				comments: [...prev.comments, newComment],
			}));

			setCommentText("");
			setSelectedText(null);

			toast({
				title: "Success",
				description: "Comment added successfully",
			});
		} catch (error) {
			console.error("Error posting comment:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to post comment",
				variant: "destructive",
			});
		} finally {
			setIsPostingComment(false);
		}
	};

	// Handle resolving/unresolving a comment
	const handleResolveComment = async (commentId, isResolved) => {
		try {
			const response = await fetch(
				`/api/bots/${botId}/prs/${prId}/comments/${commentId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ resolved: !isResolved }),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update comment");
			}

			const updatedComment = await response.json();

			// Update comments in state
			setPrData((prev) => ({
				...prev,
				comments: prev.comments.map((c) =>
					c._id === commentId ? updatedComment : c
				),
			}));

			toast({
				title: "Success",
				description: `Comment ${
					!isResolved ? "resolved" : "unresolved"
				} successfully`,
			});
		} catch (error) {
			console.error("Error updating comment:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to update comment",
				variant: "destructive",
			});
		}
	};

	// Handle merging the PR
	const handleMergePR = async () => {
		setIsMerging(true);
		try {
			const response = await fetch(`/api/bots/${botId}/prs/${prId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "complete" }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to complete pull request");
			}

			await response.json();

			toast({
				title: "Success",
				description:
					"Pull request completed successfully! The source branch has been deleted.",
			});

			// Navigate back to bot page with the target branch selected
			router.push(
				`/bots/${botId}?tab=git&branchId=${prData.pullRequest.targetBranch._id}`
			);
		} catch (error) {
			console.error("Error completing PR:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to complete pull request",
				variant: "destructive",
			});
		} finally {
			setIsMerging(false);
		}
	};

	// Helper function to display line references in comments
	const formatLineReference = (reference) => {
		if (!reference) return null;

		const { fileVersion, startLine, endLine } = reference;
		const versionLabel = fileVersion === "old" ? "old" : "new";

		if (startLine === endLine) {
			return `(${versionLabel}, ${startLine})`;
		} else {
			return `(${versionLabel}, ${startLine}-${endLine})`;
		}
	};

	// Helper function to highlight text in a comment if it matches selected text
	const highlightCommentSelections = (comment, content) => {
		// Skip if no line reference data in comment
		if (!comment.lineReference) return content;

		return (
			<div className="relative">
				{content}
				{comment.lineReference && (
					<div className="mt-2 px-3 py-2 bg-muted rounded-md text-sm border-l-2 border-primary">
						<span className="font-medium text-xs text-muted-foreground block mb-1">
							Referenced lines:
						</span>
						{formatLineReference(comment.lineReference)}
					</div>
				)}
			</div>
		);
	};

	// Function to check if a line should be highlighted based on hovered comment
	const shouldHighlightLine = (lineNum, isOldVersion) => {
		if (!hoveredComment || !hoveredComment.lineReference) return false;

		const { fileVersion, startLine, endLine } = hoveredComment.lineReference;
		const isCorrectVersion = (fileVersion === "old") === isOldVersion;

		return isCorrectVersion && lineNum >= startLine && lineNum <= endLine;
	};

	// Function to scroll to highlighted lines when a comment is hovered
	const scrollToHighlightedLines = (comment) => {
		if (!comment || !comment.lineReference) return;

		const { fileVersion, startLine } = comment.lineReference;
		const targetRef = fileVersion === "old" ? leftSideRef : rightSideRef;

		if (targetRef.current) {
			// Find the line element to scroll to
			const lineElement = targetRef.current.querySelector(
				`.line-number span[data-line="${startLine}"]`
			);
			if (lineElement) {
				lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	};

	if (loading) {
		return (
			<Card className="w-full">
				<CardContent className="p-6">
					<div className="flex justify-center items-center h-[400px]">
						<div className="flex flex-col items-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
							<p className="mt-4 text-muted-foreground">
								Loading pull request details...
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!prData) {
		return (
			<Card className="w-full">
				<CardContent className="p-6 text-center">
					<AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
					<h3 className="text-lg font-medium mb-2">Pull Request Not Found</h3>
					<p className="text-muted-foreground mb-4">
						This pull request doesn't exist or may have been deleted.
					</p>
					<Button onClick={() => router.back()}>Go Back</Button>
				</CardContent>
			</Card>
		);
	}

	const { pullRequest, diff, comments, canMerge } = prData;
	const hasUnresolvedComments = comments.some((c) => !c.resolved);
	const isPROpen = pullRequest.status === "open";

	// Update the diff processing function with the improved algorithm from commit-diff.jsx
	const processFileDiff = (diff) => {
		if (!diff || !Array.isArray(diff)) return { leftLines: [], rightLines: [] };

		// Convert diff to source and target lines
		const sourceLines = diff
			.filter((line) => line.sourceLineNum)
			.map((line) => ({
				lineNum: line.sourceLineNum,
				content: line.content,
				type: line.type,
			}));

		const targetLines = diff
			.filter((line) => line.targetLineNum)
			.map((line) => ({
				lineNum: line.targetLineNum,
				content: line.content,
				type: line.type,
			}));

		// Prepare result arrays with placeholders for alignment
		const leftLines = [];
		const rightLines = [];

		// Handle special case: if no source lines (e.g., initial PR), show everything as added
		if (sourceLines.length === 0 && targetLines.length > 0) {
			// All lines are new additions
			targetLines.forEach((line) => {
				leftLines.push(null); // Empty space on the left
				rightLines.push({
					...line,
					type: "added",
				});
			});
			return { leftLines, rightLines };
		}

		// Track which lines have been processed
		const processedSource = new Array(sourceLines.length).fill(false);
		const processedTarget = new Array(targetLines.length).fill(false);

		// Find exact matches (unchanged lines)
		const matches = [];
		for (let i = 0; i < sourceLines.length; i++) {
			for (let j = 0; j < targetLines.length; j++) {
				if (
					!processedTarget[j] &&
					sourceLines[i].content === targetLines[j].content
				) {
					matches.push({ sourceIdx: i, targetIdx: j });
					processedSource[i] = true;
					processedTarget[j] = true;
					break;
				}
			}
		}

		// Sort matches by source index to maintain order
		matches.sort((a, b) => a.sourceIdx - b.sourceIdx);

		// Reset processing arrays for second pass
		processedSource.fill(false);
		processedTarget.fill(false);

		// Process the diff in ordered chunks
		let lastProcessedSource = -1;
		let lastProcessedTarget = -1;

		// Process matches and surrounding changes
		for (let m = 0; m < matches.length; m++) {
			const match = matches[m];

			// Handle removed lines (in source but not in target)
			const removedLines = [];
			for (let i = lastProcessedSource + 1; i < match.sourceIdx; i++) {
				removedLines.push({
					...sourceLines[i],
					type: "removed",
				});
				processedSource[i] = true;
			}

			// Handle added lines (in target but not in source)
			const addedLines = [];
			for (let j = lastProcessedTarget + 1; j < match.targetIdx; j++) {
				addedLines.push({
					...targetLines[j],
					type: "added",
				});
				processedTarget[j] = true;
			}

			// Align the changes for side-by-side view
			const maxChanges = Math.max(removedLines.length, addedLines.length);
			for (let k = 0; k < maxChanges; k++) {
				leftLines.push(k < removedLines.length ? removedLines[k] : null);
				rightLines.push(k < addedLines.length ? addedLines[k] : null);
			}

			// Add the matching line (unchanged)
			leftLines.push({
				...sourceLines[match.sourceIdx],
				type: "unchanged",
			});
			rightLines.push({
				...targetLines[match.targetIdx],
				type: "unchanged",
			});

			processedSource[match.sourceIdx] = true;
			processedTarget[match.targetIdx] = true;

			lastProcessedSource = match.sourceIdx;
			lastProcessedTarget = match.targetIdx;
		}

		// Handle any remaining lines after the last match
		const remainingRemovedLines = [];
		for (let i = lastProcessedSource + 1; i < sourceLines.length; i++) {
			remainingRemovedLines.push({
				...sourceLines[i],
				type: "removed",
			});
		}

		const remainingAddedLines = [];
		for (let j = lastProcessedTarget + 1; j < targetLines.length; j++) {
			remainingAddedLines.push({
				...targetLines[j],
				type: "added",
			});
		}

		// Align the remaining changes
		const maxRemainingChanges = Math.max(
			remainingRemovedLines.length,
			remainingAddedLines.length
		);
		for (let k = 0; k < maxRemainingChanges; k++) {
			leftLines.push(
				k < remainingRemovedLines.length ? remainingRemovedLines[k] : null
			);
			rightLines.push(
				k < remainingAddedLines.length ? remainingAddedLines[k] : null
			);
		}

		return { leftLines, rightLines };
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push(`/bots/${botId}/prs`)}
						className="gap-1"
					>
						<ArrowLeft className="h-4 w-4" /> Back to Pull Requests
					</Button>
				</div>

				{isPROpen && canMerge && (
					<Button
						onClick={() => setShowMergeDialog(true)}
						className="gap-1"
						disabled={isMerging}
					>
						<GitMerge className="h-4 w-4" />
						{isMerging ? "Merging..." : "Complete Pull Request"}
					</Button>
				)}
			</div>

			{/* PR Header */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center gap-2 mb-1">
						{pullRequest.status === "open" ? (
							<Badge variant="default" className="px-2 py-1 gap-1">
								<PullRequest className="h-3.5 w-3.5" /> Open
							</Badge>
						) : pullRequest.status === "completed" ? (
							<Badge variant="success" className="px-2 py-1 gap-1">
								<GitMerge className="h-3.5 w-3.5" /> Merged
							</Badge>
						) : (
							<Badge variant="secondary" className="px-2 py-1 gap-1">
								<X className="h-3.5 w-3.5" /> Closed
							</Badge>
						)}
						<CardTitle className="text-xl">{pullRequest.title}</CardTitle>
					</div>

					<div className="text-sm text-muted-foreground flex items-center gap-2">
						<span>
							Created{" "}
							{formatDistanceToNow(new Date(pullRequest.createdAt), {
								addSuffix: true,
							})}
						</span>
						<span>by {pullRequest.creator?.name || "Unknown"}</span>
					</div>

					<div className="mt-3 flex items-center gap-2">
						<div className="flex items-center text-sm">
							<GitBranch className="h-4 w-4 mr-1" />
							<span className="font-medium">
								{pullRequest.sourceBranch?.name ||
									pullRequest.sourceBranchName ||
									"Deleted branch"}
								{pullRequest.sourceBranch?.deleted && (
									<span className="ml-1 text-xs text-muted-foreground">
										(deleted)
									</span>
								)}
							</span>
							<span className="mx-2">→</span>
							<span className="font-medium">
								{pullRequest.targetBranch?.name ||
									pullRequest.targetBranchName ||
									"Unknown branch"}
							</span>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					{pullRequest.description && (
						<div className="mb-4 prose prose-sm dark:prose-invert max-w-none">
							<p>{pullRequest.description}</p>
						</div>
					)}

					{hasUnresolvedComments && isPROpen && (
						<div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm flex items-center gap-2 mb-4">
							<AlertCircle className="h-4 w-4" />
							<span>
								All comments must be resolved before this PR can be completed.
							</span>
						</div>
					)}

					{!isPROpen && pullRequest.status === "completed" && (
						<div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-3 rounded-md text-sm flex items-center gap-2 mb-4">
							<CheckCircle className="h-4 w-4" />
							<span>
								This PR was completed{" "}
								{formatDistanceToNow(new Date(pullRequest.completedAt), {
									addSuffix: true,
								})}
								{pullRequest.sourceBranch?.deleted &&
									". The source branch has been deleted."}
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* File Changes / Diff Viewer */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg flex items-center gap-2">
						<FileCode className="h-5 w-5" /> Changes
					</CardTitle>
				</CardHeader>
				<CardContent>
					{diff ? (
						<div className="border rounded-md overflow-hidden">
							<div className="bg-muted/50 p-2 border-b flex justify-between items-center">
								<span className="text-sm font-medium">model.json</span>
								<div className="flex items-center gap-2 text-xs">
									<Badge variant="outline" className="gap-1">
										<Plus className="h-3 w-3 text-green-500" />{" "}
										{diff.filter((d) => d.type === "added").length}
									</Badge>
									<Badge variant="outline" className="gap-1">
										<Minus className="h-3 w-3 text-red-500" />{" "}
										{diff.filter((d) => d.type === "removed").length}
									</Badge>
								</div>
							</div>

							{/* Side-by-side diff view with selection support */}
							<div className="flex" ref={diffContainerRef}>
								{/* Process the diff with the improved algorithm */}
								{(() => {
									const { leftLines, rightLines } = processFileDiff(diff);

									return (
										<>
											{/* Left side (old version) */}
											<ScrollArea
												className="h-[400px] w-1/2 border-r left-side"
												ref={leftSideRef}
											>
												<div className="p-1 relative">
													{leftLines.map((line, index) => {
														if (!line) {
															// Empty spacer for alignment
															return (
																<div
																	key={`left-${index}`}
																	className="h-6"
																></div>
															);
														}

														const isHighlighted = shouldHighlightLine(
															line.lineNum,
															true
														);

														return (
															<div
																key={`left-${index}`}
																className={`diff-line flex hover:bg-muted/60 ${
																	line.type === "removed"
																		? "bg-red-100 dark:bg-red-900/20"
																		: ""
																} ${
																	isHighlighted
																		? "bg-yellow-100 dark:bg-yellow-900/30 border-l-2 border-yellow-500"
																		: ""
																}`}
															>
																<div className="w-14 flex-shrink-0 text-right pr-2 text-muted-foreground select-none border-r line-number">
																	<span
																		className="text-xs"
																		data-line={line.lineNum}
																	>
																		{line.lineNum}
																	</span>
																</div>
																<div className="px-4 whitespace-pre-wrap overflow-x-auto flex-1">
																	<span
																		className={
																			line.type === "removed"
																				? "text-red-600 dark:text-red-400"
																				: ""
																		}
																	>
																		{line.content}
																	</span>
																</div>
															</div>
														);
													})}
												</div>
											</ScrollArea>

											{/* Right side (new version) */}
											<ScrollArea
												className="h-[400px] w-1/2 right-side"
												ref={rightSideRef}
											>
												<div className="p-1 relative">
													{rightLines.map((line, index) => {
														if (!line) {
															// Empty spacer for alignment
															return (
																<div
																	key={`right-${index}`}
																	className="h-6"
																></div>
															);
														}

														const isHighlighted = shouldHighlightLine(
															line.lineNum,
															false
														);

														return (
															<div
																key={`right-${index}`}
																className={`diff-line flex hover:bg-muted/60 ${
																	line.type === "added"
																		? "bg-green-100 dark:bg-green-900/20"
																		: ""
																} ${
																	isHighlighted
																		? "bg-yellow-100 dark:bg-yellow-900/30 border-l-2 border-yellow-500"
																		: ""
																}`}
															>
																<div className="w-14 flex-shrink-0 text-right pr-2 text-muted-foreground select-none border-r line-number">
																	<span
																		className="text-xs"
																		data-line={line.lineNum}
																	>
																		{line.lineNum}
																	</span>
																</div>
																<div className="px-4 whitespace-pre-wrap overflow-x-auto flex-1">
																	<span
																		className={
																			line.type === "added"
																				? "text-green-600 dark:text-green-400"
																				: ""
																		}
																	>
																		{line.content}
																	</span>
																</div>
															</div>
														);
													})}
												</div>
											</ScrollArea>
										</>
									);
								})()}
							</div>

							{/* Selection indicator */}
							{selectedText && (
								<div className="p-4 border-t bg-muted/30">
									<div className="mb-2 text-sm font-medium">
										Referenced lines included in your comment:
									</div>
									<div className="px-3 py-2 bg-primary/5 border-l-2 border-primary rounded text-sm">
										{formatLineReference(selectedText)}
									</div>
								</div>
							)}
						</div>
					) : (
						<div className="text-center py-8">
							<FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
							<h3 className="text-lg font-medium mb-2">No changes available</h3>
							<p className="text-muted-foreground">
								Unable to load file differences for this pull request.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Comments Section */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg flex items-center gap-2">
						<MessageSquare className="h-5 w-5" /> Discussion
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{comments &&
							comments.map((comment) => (
								<div
									key={comment._id}
									className="flex gap-4 pb-4 border-b last:border-0"
									onMouseEnter={() => {
										setHoveredComment(comment);
										scrollToHighlightedLines(comment);
									}}
									onMouseLeave={() => setHoveredComment(null)}
								>
									<Avatar>
										<AvatarImage src={comment.user?.image} />
										<AvatarFallback>
											{comment.user?.name?.[0] || "U"}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<div className="flex justify-between items-center mb-1">
											<div className="font-medium flex items-center gap-2">
												{comment.user?.name || "Unknown"}
												<span className="text-xs text-muted-foreground">
													{formatDistanceToNow(new Date(comment.createdAt), {
														addSuffix: true,
													})}
												</span>
											</div>
											{isPROpen && (
												<Button
													variant="ghost"
													size="sm"
													className={`h-7 gap-1 ${
														comment.resolved
															? "text-green-600 dark:text-green-400"
															: ""
													}`}
													onClick={() =>
														handleResolveComment(comment._id, comment.resolved)
													}
												>
													{comment.resolved ? (
														<CheckCircle className="h-4 w-4" />
													) : (
														<Circle className="h-4 w-4" />
													)}
													{comment.resolved ? "Resolved" : "Resolve"}
												</Button>
											)}
										</div>
										<div className="prose prose-sm dark:prose-invert max-w-none">
											{highlightCommentSelections(comment, comment.content)}
										</div>
									</div>
								</div>
							))}

						{isPROpen && (
							<div className="flex gap-4 pt-4">
								<Avatar>
									<AvatarFallback>YOU</AvatarFallback>
								</Avatar>
								<div className="flex-1 space-y-2">
									<Textarea
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										placeholder="Add a comment..."
										className="min-h-24"
									/>
									<div className="flex justify-end">
										<Button
											onClick={handlePostComment}
											disabled={isPostingComment || !commentText.trim()}
											className="gap-1"
										>
											{isPostingComment && (
												<Loader2 className="h-4 w-4 animate-spin" />
											)}
											Comment
										</Button>
									</div>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Merge Confirmation Dialog */}
			<Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Complete Pull Request</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="mb-4">
							Are you sure you want to complete this pull request? This will:
						</p>
						<ul className="list-disc list-inside space-y-1 text-sm">
							<li>
								Merge changes from{" "}
								<span className="font-medium">
									{pullRequest.sourceBranch?.name}
								</span>{" "}
								into{" "}
								<span className="font-medium">
									{pullRequest.targetBranch?.name}
								</span>
							</li>
							<li>
								Delete the source branch{" "}
								<span className="font-medium">
									{pullRequest.sourceBranch?.name}
								</span>{" "}
								(the branch name will still be visible in the PR history)
							</li>
							<li>Close this pull request</li>
						</ul>

						{hasUnresolvedComments && (
							<div className="mt-4 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm">
								<AlertCircle className="h-4 w-4 inline-block mr-2" />
								All comments must be resolved before completing this pull
								request.
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowMergeDialog(false)}
							disabled={isMerging}
						>
							Cancel
						</Button>
						<Button
							onClick={handleMergePR}
							disabled={isMerging || hasUnresolvedComments}
							className="gap-1"
						>
							{isMerging ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Merging...
								</>
							) : (
								<>
									<GitMerge className="h-4 w-4" />
									Complete Pull Request
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
