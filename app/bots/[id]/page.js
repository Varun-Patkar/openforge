"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Add useSearchParams
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	MessageSquare,
	Edit,
	Trash2,
	AlertTriangle,
	User,
	GitPullRequest,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getBotById, deleteBot } from "@/lib/api";
import { createChat } from "@/lib/chat-api";
import { useToast } from "@/hooks/use-toast";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BranchSelector } from "@/components/branch-selector";
import { CommitHistory } from "@/components/commit-history";
import { CommitDiff } from "@/components/commit-diff";
import { GitBranch, GitCommit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CollaboratorManagement } from "@/components/collaborator-management";
import Link from "next/link";

export default function BotPage({ params }) {
	const router = useRouter();
	const searchParams = useSearchParams(); // Add this line to get search params
	const { status, user } = useAuth();
	const { toast } = useToast();
	const botId = params.id;

	// Get URL parameters
	const branchIdFromQuery = searchParams.get("branchId");
	const activeTabFromQuery = searchParams.get("tab");
	const commitIdFromQuery = searchParams.get("commitId");

	const [bot, setBot] = useState(null);
	const [isOwner, setIsOwner] = useState(false);
	const [isCollaborator, setIsCollaborator] = useState(false); // Add missing state variable
	const [isLoading, setIsLoading] = useState(true);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [currentBranch, setCurrentBranch] = useState(null);
	const [selectedCommit, setSelectedCommit] = useState(null);
	const [showGitTab, setShowGitTab] = useState(false);
	const [showBranchDialog, setShowBranchDialog] = useState(false);
	const [branches, setBranches] = useState([]);
	const [selectedBaseBranch, setSelectedBaseBranch] = useState(null);
	const [activeTab, setActiveTab] = useState("details");

	// Set the active tab based on query parameter
	useEffect(() => {
		if (
			activeTabFromQuery &&
			["details", "examples", "git"].includes(activeTabFromQuery)
		) {
			setActiveTab(activeTabFromQuery);
			if (activeTabFromQuery === "git") {
				setShowGitTab(true);
			}
		}
	}, [activeTabFromQuery]);

	// Load bot data and check ownership
	useEffect(() => {
		const loadBot = async () => {
			try {
				const botData = await getBotById(botId);
				if (botData) {
					setBot({ ...botData, id: botData._id.toString() }); // Ensure ID is a string

					// Check if current user is the owner or a collaborator
					if (status === "authenticated" && user) {
						// isOwner and isCollaborator should now come from the API
						setIsOwner(botData.isOwner);
						setIsCollaborator(botData.isCollaborator);
					}
				} else {
					// Handle bot not found scenario
					setBot(null); // Explicitly set to null if not found
				}
			} catch (error) {
				console.error("Error loading bot:", error);
				toast({
					title: "Error",
					description: "Failed to load bot details",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		if (botId) {
			loadBot();
		}
	}, [botId, status, user, toast]);

	// Add this to initialize branches on component mount
	useEffect(() => {
		if (botId && showGitTab) {
			// Fetch the default branch when "Versions" tab is activated
			const fetchDefaultBranch = async () => {
				try {
					const response = await fetch(`/api/bots/${botId}/branches`);
					if (response.ok) {
						const branches = await response.json();
						const defaultBranch =
							branches.find((b) => b.isDefault) ||
							(branches.length > 0 ? branches[0] : null);
						if (defaultBranch) {
							setCurrentBranch(defaultBranch);
							setSelectedBaseBranch(defaultBranch);
						}
					}
				} catch (error) {
					console.error("Failed to fetch default branch:", error);
					toast({
						title: "Error",
						description: "Failed to load branch information",
						variant: "destructive",
					});
				}
			};

			fetchDefaultBranch();
		}
	}, [botId, showGitTab, toast]);

	// Add this function to load all branches
	const loadBranches = useCallback(async () => {
		try {
			const response = await fetch(`/api/bots/${botId}/branches`);
			if (response.ok) {
				const branchesData = await response.json();
				setBranches(branchesData);
				return branchesData;
			}
		} catch (error) {
			console.error("Failed to fetch branches:", error);
		}
		return [];
	}, [botId]);

	// Load branch from query param
	useEffect(() => {
		if (botId && branchIdFromQuery && !isLoading && branches.length > 0) {
			const branch = branches.find((b) => b._id === branchIdFromQuery);
			if (branch) {
				setCurrentBranch(branch);
			}
		}
	}, [botId, branchIdFromQuery, branches, isLoading]);

	// Load commit from query param
	useEffect(() => {
		if (botId && commitIdFromQuery && showGitTab && currentBranch) {
			const loadSelectedCommit = async () => {
				try {
					const response = await fetch(
						`/api/bots/${botId}/commits/${commitIdFromQuery}`
					);
					if (response.ok) {
						const commit = await response.json();
						setSelectedCommit(commit);
					}
				} catch (error) {
					console.error("Failed to load commit:", error);
				}
			};
			loadSelectedCommit();
		}
	}, [botId, commitIdFromQuery, showGitTab, currentBranch]);

	// Reset selected commit whenever the branch changes
	useEffect(() => {
		// This ensures the selected commit is cleared when branch changes
		setSelectedCommit(null);
	}, [currentBranch]);

	const handleChatWithBot = async () => {
		try {
			// Always create a new chat with current date/time as title
			const title = new Date().toLocaleString();
			const newChat = await createChat(bot.id, title);

			// Navigate to the new chat
			router.push(`/chat/${newChat.id}`);
		} catch (error) {
			console.error("Error creating chat:", error);
			toast({
				title: "Error",
				description: "Failed to create chat",
				variant: "destructive",
			});
		}
	};

	const handleEditBot = () => {
		// Pass the current branch ID when navigating to edit page
		if (currentBranch) {
			router.push(`/bots/${botId}/edit?branchId=${currentBranch._id}`);
		} else {
			router.push(`/bots/${botId}/edit`);
		}
	};

	const handleDeleteBot = async () => {
		if (!user?.id) {
			toast({
				title: "Error",
				description: "Authentication required.",
				variant: "destructive",
			});
			return;
		}
		try {
			await deleteBot(botId, user.id); // Pass user.id for authorization
			toast({
				title: "Success",
				description: "Bot has been deleted",
			});
			router.push("/dashboard");
		} catch (error) {
			console.error("Error deleting bot:", error);
			toast({
				title: "Error",
				description: "Failed to delete bot",
				variant: "destructive",
			});
		}
	};

	const handleBranchChange = (branch) => {
		setCurrentBranch(branch);
		setSelectedCommit(null); // Reset selected commit when branch changes
	};

	const handleCommitSelect = (commit) => {
		setSelectedCommit(commit);
	};

	const handleChatWithCommit = async (commit) => {
		try {
			// Always create a new chat with commit details in title
			const branchName = currentBranch ? currentBranch.name : "unknown";
			const commitId = commit._id.toString().substring(0, 8);
			const title = `${bot.name} (${branchName}@${commitId})`;

			// We'll need to extend the chat API to store commit reference
			const newChat = await createChat(bot.id, title, commit._id);

			// Navigate to the new chat
			router.push(`/chat/${newChat.id}`);
		} catch (error) {
			console.error("Error creating chat for commit:", error);
			toast({
				title: "Error",
				description: "Failed to create chat for this commit version",
				variant: "destructive",
			});
		}
	};

	// Update the branch creation function
	const handleCreateBranch = useCallback(
		async (branchName, sourceBranchId) => {
			if (!branchName.trim() || !botId) {
				toast({
					title: "Error",
					description: "Branch name is required",
					variant: "destructive",
				});
				return;
			}

			try {
				const response = await fetch(`/api/bots/${botId}/branches`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: branchName,
						sourceBranchId: sourceBranchId || currentBranch?._id || null,
					}),
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || "Failed to create branch");
				}

				const newBranch = await response.json();
				setCurrentBranch(newBranch);
				setSelectedCommit(null);

				// Refresh branches list
				await loadBranches();

				toast({
					title: "Success",
					description: `Branch "${branchName}" created successfully`,
				});

				return newBranch;
			} catch (error) {
				console.error("Error creating branch:", error);
				toast({
					title: "Error",
					description: error.message || "Failed to create branch",
					variant: "destructive",
				});
				return null;
			}
		},
		[botId, currentBranch, toast, loadBranches]
	);

	// Add this function to delete a branch
	const handleDeleteBranch = async (branchId) => {
		if (!branchId || !botId) {
			toast({
				title: "Error",
				description: "Invalid branch",
				variant: "destructive",
			});
			return;
		}

		try {
			const response = await fetch(`/api/bots/${botId}/branches/${branchId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete branch");
			}

			// Refresh branches list
			const branchesData = await loadBranches();

			// If current branch was deleted, switch to default or first available
			if (currentBranch?._id === branchId) {
				const defaultBranch =
					branchesData.find((b) => b.isDefault) ||
					(branchesData.length > 0 ? branchesData[0] : null);

				setCurrentBranch(defaultBranch);
				setSelectedCommit(null);
			}

			toast({
				title: "Success",
				description: "Branch deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting branch:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to delete branch",
				variant: "destructive",
			});
		}
	};

	// Show not authorized message if bot is private and user is not owner or collaborator
	if (
		!isLoading &&
		bot &&
		bot.visibility === "private" &&
		!isOwner &&
		!isCollaborator
	) {
		return (
			<div className="container px-4 py-16 mx-auto max-w-[90%]">
				<Card className="border-destructive">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
							<AlertTriangle className="h-12 w-12 text-destructive" />
							<h2 className="text-2xl font-bold">Not Authorized</h2>
							<p className="text-muted-foreground max-w-md">
								This bot is private and only accessible to its owner and
								collaborators.
							</p>
							<Button onClick={() => router.push("/dashboard")}>
								Return to Dashboard
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<h2 className="mt-4 text-xl font-semibold">Loading bot details...</h2>
				</div>
			</div>
		);
	}

	if (!bot) {
		return (
			<div className="container px-4 py-16 mx-auto max-w-[90%]">
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
							<AlertTriangle className="h-12 w-12 text-muted-foreground" />
							<h2 className="text-2xl font-bold">Bot Not Found</h2>
							<p className="text-muted-foreground">
								The bot you're looking for doesn't exist or has been removed.
							</p>
							<Button onClick={() => router.push("/dashboard")}>
								Return to Dashboard
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container px-4 py-8 mx-auto max-w-[95%]">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-3xl font-bold">{bot.name}</h1>
						<Badge
							variant={bot.visibility === "public" ? "secondary" : "outline"}
						>
							{bot.visibility}
						</Badge>
					</div>
					<p className="text-muted-foreground">{bot.description}</p>

					{/* Creator information */}
					{bot.creator && (
						<div className="flex items-center mt-2 text-sm text-muted-foreground">
							<span className="mr-2">Created by:</span>
							<Link
								href={`/profile/${bot.creator._id || bot.userId}`}
								className="flex items-center hover:text-primary transition-colors"
							>
								<Avatar className="h-6 w-6 mr-2">
									<AvatarImage
										src={bot.creator.image}
										alt={bot.creator.name || "Creator"}
									/>
									<AvatarFallback>
										{bot.creator.name
											? bot.creator.name.charAt(0).toUpperCase()
											: "U"}
									</AvatarFallback>
								</Avatar>
								<span>{bot.creator.name || "Anonymous User"}</span>
							</Link>
						</div>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{(isOwner || isCollaborator) && currentBranch && (
						<BranchSelector
							botId={botId}
							currentBranch={currentBranch}
							onBranchChange={handleBranchChange}
							onBranchDelete={handleDeleteBranch}
							onCreateBranch={handleCreateBranch}
						/>
					)}

					<Button onClick={() => handleChatWithBot()} className="gap-1">
						<MessageSquare className="h-4 w-4" /> Chat with this Bot
					</Button>

					{(isOwner || isCollaborator) && (
						<Button variant="outline" onClick={handleEditBot} className="gap-1">
							<Edit className="h-4 w-4" /> Edit
						</Button>
					)}

					{isOwner && (
						<Button
							variant="destructive"
							onClick={() => setShowDeleteDialog(true)}
							className="gap-1"
						>
							<Trash2 className="h-4 w-4" /> Delete
						</Button>
					)}
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="examples">Examples</TabsTrigger>
					{(isOwner || isCollaborator || bot.visibility === "public") && (
						<TabsTrigger value="git" onClick={() => setShowGitTab(true)}>
							<GitBranch className="h-4 w-4 mr-1" /> Versions
						</TabsTrigger>
					)}
					{/* Add PR tab */}
					{(isOwner || isCollaborator || bot.visibility === "public") && (
						<TabsTrigger
							value="prs"
							onClick={() => router.push(`/bots/${botId}/prs`)}
						>
							<GitPullRequest className="h-4 w-4 mr-1" /> Pull Requests
						</TabsTrigger>
					)}
					{/* Collaborators tab */}
					{(isOwner || isCollaborator) && (
						<TabsTrigger value="collaborators">
							<User className="h-4 w-4 mr-1" /> Collaborators
						</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value="details">
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>System Prompt</CardTitle>
								<CardDescription>
									Base instructions that define this bot's behavior
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="bg-muted/30 p-4 rounded-md">
									<Textarea
										value={bot.systemPrompt || "No system prompt defined."}
										readOnly
										rows="7"
										className="resize-vertical min-h-32 w-full bg-transparent border-0 focus-visible:ring-0 p-0"
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>LLM Parameters</CardTitle>
								<CardDescription>
									Default configuration for model response generation
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="space-y-2">
										<h3 className="text-sm font-medium">Temperature</h3>
										<div className="flex items-center gap-2">
											<div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-md">
												{bot.temperature || 0.7}
											</div>
											<span className="text-sm text-muted-foreground">
												{bot.temperature === 0
													? "More deterministic"
													: bot.temperature >= 1
													? "More creative"
													: "Balanced"}
											</span>
										</div>
									</div>

									<div className="space-y-2">
										<h3 className="text-sm font-medium">Top P</h3>
										<div className="flex items-center gap-2">
											<div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-md">
												{bot.topP || 0.9}
											</div>
											<span className="text-sm text-muted-foreground">
												{bot.topP <= 0.5
													? "More focused"
													: bot.topP >= 0.9
													? "More diverse"
													: "Balanced"}
											</span>
										</div>
									</div>

									<div className="space-y-2">
										<h3 className="text-sm font-medium">Context Window</h3>
										<div className="flex items-center gap-2">
											<div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-md">
												{bot.contextMessagesCount || 3}
											</div>
											<span className="text-sm text-muted-foreground">
												Previous messages included
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="examples">
					<Card>
						<CardHeader>
							<CardTitle>Test-case Examples</CardTitle>
							<CardDescription>
								Sample conversations that illustrate how this bot should behave
							</CardDescription>
						</CardHeader>
						<CardContent>
							{bot.examples && bot.examples.length > 0 ? (
								<div className="space-y-6">
									{bot.examples.map((example, index) => (
										<div
											key={index}
											className="border rounded-md overflow-hidden"
										>
											<div className="p-4 bg-muted/30">
												<p className="font-medium mb-2">User Input:</p>
												<div className="bg-background p-3 rounded-md">
													{example.input}
												</div>
											</div>
											<div className="p-4 border-t">
												<p className="font-medium mb-2">Expected Output:</p>
												<div className="bg-background p-3 rounded-md">
													{example.expectedOutput}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted-foreground italic">
									No examples provided.
								</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="git">
					{showGitTab && (
						<>
							<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
								<h2 className="text-xl font-semibold">Version Control</h2>
							</div>
							<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
								{/* Reduce width of commit history to 1/5 of the container */}
								<div className="lg:col-span-1">
									<CommitHistory
										botId={botId}
										branch={currentBranch}
										selectedCommit={selectedCommit}
										onCommitSelect={handleCommitSelect}
									/>
								</div>
								{/* Increase width of commit diff to 4/5 of the container */}
								<div className="lg:col-span-4">
									{selectedCommit ? (
										<CommitDiff commit={selectedCommit} botId={botId} />
									) : (
										<Card>
											<CardContent className="p-6 text-center">
												<GitCommit className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
												<h3 className="text-lg font-medium mb-2">
													{currentBranch
														? "Select a commit from the history"
														: "Please select a branch first"}
												</h3>
												<p className="text-sm text-muted-foreground mb-4">
													{currentBranch
														? "Choose a commit from the left panel to view details"
														: "Select a branch to see its commit history"}
												</p>
											</CardContent>
										</Card>
									)}

									{selectedCommit && (
										<div className="mt-4 flex justify-end">
											<Button
												onClick={() => handleChatWithCommit(selectedCommit)}
												className="gap-1"
											>
												<MessageSquare className="h-4 w-4" /> Chat with this
												Version
											</Button>
										</div>
									)}
								</div>
							</div>
						</>
					)}
				</TabsContent>

				{/* New Collaborators Tab */}
				<TabsContent value="collaborators">
					<CollaboratorManagement botId={botId} isOwner={isOwner} />
				</TabsContent>
			</Tabs>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete "{bot.name}" and all of its data.
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteBot}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
