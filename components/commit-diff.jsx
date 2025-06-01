"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	FileCode,
	FileText,
	Loader2,
	Plus,
	Minus,
	Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function CommitDiff({ commit, botId }) {
	const [diffData, setDiffData] = useState(null);
	const [parentData, setParentData] = useState(null);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchCommitData = async () => {
			if (!commit || !commit._id) return;

			setLoading(true);
			try {
				// Fetch current commit data
				const response = await fetch(
					`/api/bots/${botId}/commits/${commit._id}`
				);

				if (!response.ok) {
					throw new Error("Failed to fetch commit details");
				}

				const data = await response.json();
				setDiffData(data);

				// If this commit has a parent, fetch parent data for diff
				if (!data.isInitialCommit && data.parentCommitId) {
					const parentResponse = await fetch(
						`/api/bots/${botId}/commits/${data.parentCommitId}`
					);

					if (parentResponse.ok) {
						const parentCommitData = await parentResponse.json();
						setParentData(parentCommitData);
					}
				}
			} catch (error) {
				console.error("Error fetching commit data:", error);
				toast({
					title: "Error",
					description: "Failed to load commit details",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchCommitData();
	}, [commit, botId, toast]);

	// Add download handler function
	const handleDownload = async () => {
		if (!commit || !commit._id) return;

		try {
			// Create download URL with commit ID
			const downloadUrl = `/api/bots/${botId}/download?commitId=${commit._id}`;

			// Create a hidden link and trigger the download
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = `model_${commit._id.toString().substring(0, 8)}.zip`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error("Error downloading model:", error);
			toast({
				title: "Error",
				description: "Failed to download model",
				variant: "destructive",
			});
		}
	};

	if (loading) {
		return (
			<Card className="h-full">
				<CardContent className="flex justify-center items-center h-[400px]">
					<div className="flex flex-col items-center">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
						<p className="text-muted-foreground">Loading commit details...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!diffData) {
		return (
			<Card className="h-full">
				<CardContent className="p-6 text-center">
					<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
					<h3 className="text-lg font-medium mb-2">No details available</h3>
					<p className="text-sm text-muted-foreground">
						Unable to load commit information
					</p>
				</CardContent>
			</Card>
		);
	}

	const modelState = diffData?.hydratedModelState || diffData?.modelState;
	const parentModelState =
		parentData?.hydratedModelState || parentData?.modelState;

	if (!modelState) {
		return (
			<Card className="h-full">
				<CardContent className="p-6 text-center">
					<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
					<h3 className="text-lg font-medium mb-2">No model state available</h3>
					<p className="text-sm text-muted-foreground">
						This commit does not contain model state information
					</p>
				</CardContent>
			</Card>
		);
	}

	// Format the model states as properly indented JSON
	const currentJson = JSON.stringify(modelState, null, 2);
	const parentJson = parentModelState
		? JSON.stringify(parentModelState, null, 2)
		: null;

	// Create diffable lines for comparison
	const currentLines = currentJson.split("\n");
	const parentLines = parentJson ? parentJson.split("\n") : [];

	// Simple line diff: actual production code would use a proper diff algorithm
	const renderDiff = () => {
		// If no parent (initial commit), show everything as added
		if (!parentJson) {
			return currentLines.map((line, i) => (
				<div key={i} className="diff-line diff-addition">
					<span className="diff-marker">+</span>
					<span className="text-green-500">{line}</span>
				</div>
			));
		}

		// Improved diff visualization that focuses on actual changes
		const diffLines = [];
		let i = 0,
			j = 0;
		const contextLines = 3; // Number of unchanged lines to show as context

		// Track which lines have been processed
		const processedParent = new Array(parentLines.length).fill(false);
		const processedCurrent = new Array(currentLines.length).fill(false);

		// First pass: Find exact matches
		const matches = [];
		for (i = 0; i < parentLines.length; i++) {
			for (j = 0; j < currentLines.length; j++) {
				if (!processedCurrent[j] && parentLines[i] === currentLines[j]) {
					matches.push({ parentIdx: i, currentIdx: j });
					processedParent[i] = true;
					processedCurrent[j] = true;
					break;
				}
			}
		}

		// Sort matches by current index to maintain order
		matches.sort((a, b) => a.currentIdx - b.currentIdx);

		// Reset processing arrays for second pass
		processedParent.fill(false);
		processedCurrent.fill(false);

		// Second pass: Add all lines with proper markers
		let lastProcessedParent = -1;
		let lastProcessedCurrent = -1;

		// Process matches and add context
		for (let m = 0; m < matches.length; m++) {
			const match = matches[m];

			// Add deletions (lines in parent that don't appear in current)
			for (i = lastProcessedParent + 1; i < match.parentIdx; i++) {
				diffLines.push(
					<div key={`d-${i}`} className="diff-line diff-removal">
						<span className="diff-marker">-</span>
						<span className="text-red-500">{parentLines[i]}</span>
					</div>
				);
				processedParent[i] = true;
			}

			// Add additions (lines in current that don't appear in parent)
			for (j = lastProcessedCurrent + 1; j < match.currentIdx; j++) {
				diffLines.push(
					<div key={`a-${j}`} className="diff-line diff-addition">
						<span className="diff-marker">+</span>
						<span className="text-green-500">{currentLines[j]}</span>
					</div>
				);
				processedCurrent[j] = true;
			}

			// Add the matching line
			diffLines.push(
				<div key={`m-${match.currentIdx}`} className="diff-line">
					<span className="diff-marker"> </span>
					<span>{currentLines[match.currentIdx]}</span>
				</div>
			);
			processedParent[match.parentIdx] = true;
			processedCurrent[match.currentIdx] = true;

			lastProcessedParent = match.parentIdx;
			lastProcessedCurrent = match.currentIdx;
		}

		// Add any remaining deletions
		for (i = lastProcessedParent + 1; i < parentLines.length; i++) {
			diffLines.push(
				<div key={`d-${i}`} className="diff-line diff-removal">
					<span className="diff-marker">-</span>
					<span className="text-red-500">{parentLines[i]}</span>
				</div>
			);
		}

		// Add any remaining additions
		for (j = lastProcessedCurrent + 1; j < currentLines.length; j++) {
			diffLines.push(
				<div key={`a-${j}`} className="diff-line diff-addition">
					<span className="diff-marker">+</span>
					<span className="text-green-500">{currentLines[j]}</span>
				</div>
			);
		}

		return diffLines;
	};

	return (
		<Card className="h-full">
			<CardHeader className="pb-2">
				<div className="flex justify-between items-start mb-1">
					<CardTitle className="flex items-center gap-2">
						<FileCode className="h-5 w-5" />
						Commit Details
					</CardTitle>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="font-mono">
							{commit._id.substring(0, 8)}
						</Badge>
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownload}
							className="ml-2"
						>
							<Download className="h-4 w-4 mr-1" />
							Download
						</Button>
					</div>
				</div>
				<div className="text-sm text-muted-foreground">
					{commit.message}
					{commit.createdAt && (
						<span className="ml-2">
							({format(new Date(commit.createdAt), "MMM d, yyyy h:mm a")})
						</span>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="mt-2">
					{/* File header with info about the type of diff */}
					<div className="flex items-center justify-between px-4 py-2 bg-muted/30 border border-border rounded-t-md">
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium text-sm">model.json</span>
						</div>
						<div className="text-xs">
							{diffData?.isInitialCommit ? (
								<Badge
									variant="outline"
									className="flex items-center gap-1 bg-green-500/10"
								>
									<Plus className="h-3 w-3" /> Initial Commit
								</Badge>
							) : parentData ? (
								<Badge variant="outline">
									Showing changes from previous version
								</Badge>
							) : (
								<Badge variant="outline" className="text-muted-foreground">
									No parent data available
								</Badge>
							)}
						</div>
					</div>

					{/* File content with diff - increased height from 400px to 700px */}
					<div className="border border-t-0 border-border rounded-b-md bg-muted/10">
						<ScrollArea className="h-[700px] w-full">
							<pre className="text-sm font-mono p-4 whitespace-pre-wrap overflow-visible diff-container">
								{renderDiff()}
							</pre>
						</ScrollArea>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
