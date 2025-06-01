"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus, GitBranch } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getBotById, updateBot } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BranchSelector } from "@/components/branch-selector";

export default function EditBotPage({ params }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { status } = useAuth();
	const { toast } = useToast();
	const botId = params.id;

	// Get branchId from query params if available
	const branchIdFromQuery = searchParams.get("branchId");

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		visibility: "Private",
		systemPrompt: "",
		examples: [{ input: "", expectedOutput: "" }],
		// LLM parameters with defaults
		temperature: 0.7,
		topP: 0.9,
		contextMessagesCount: 3,
	});

	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [branches, setBranches] = useState([]);
	const [currentBranch, setCurrentBranch] = useState(null);

	// Load branches for this bot
	const loadBranches = useCallback(async () => {
		try {
			const response = await fetch(`/api/bots/${botId}/branches`);
			if (response.ok) {
				const branchesData = await response.json();
				setBranches(branchesData);

				// If we have a branch ID from query params, select it
				if (branchIdFromQuery) {
					const selectedBranch = branchesData.find(
						(b) => b._id === branchIdFromQuery
					);
					if (selectedBranch) {
						setCurrentBranch(selectedBranch);
						return;
					}
				}

				// Otherwise select the default branch
				const defaultBranch =
					branchesData.find((b) => b.isDefault) ||
					(branchesData.length > 0 ? branchesData[0] : null);
				if (defaultBranch) {
					setCurrentBranch(defaultBranch);
				}
			}
		} catch (error) {
			console.error("Failed to fetch branches:", error);
			toast({
				title: "Error",
				description: "Failed to load branch information",
				variant: "destructive",
			});
		}
	}, [botId, branchIdFromQuery, toast]);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
			return;
		}

		const loadBot = async () => {
			try {
				setIsLoading(true);
				const botData = await getBotById(botId);
				if (!botData) {
					toast({
						title: "Error",
						description: "Bot not found",
						variant: "destructive",
					});
					router.push("/dashboard");
					return;
				}

				// Check if current user is the owner or a collaborator
				if (!botData.isOwner && !botData.isCollaborator) {
					toast({
						title: "Unauthorized",
						description: "You don't have permission to edit this bot",
						variant: "destructive",
					});
					router.push(`/bots/${botId}`);
					return;
				}

				setFormData({
					name: botData.name || "",
					description: botData.description || "",
					visibility: botData.visibility || "Private",
					systemPrompt: botData.systemPrompt || "",
					examples:
						botData.examples?.length > 0
							? botData.examples
							: [{ input: "", expectedOutput: "" }],
					// Load LLM parameters with defaults if not present
					temperature:
						botData.temperature !== undefined ? botData.temperature : 0.7,
					topP: botData.topP !== undefined ? botData.topP : 0.9,
					contextMessagesCount:
						botData.contextMessagesCount !== undefined
							? botData.contextMessagesCount
							: 3,
				});

				// Load branches after loading bot
				await loadBranches();
			} catch (error) {
				console.error("Error loading bot:", error);
				toast({
					title: "Error",
					description: "Failed to load bot data. Please try again.",
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
	}, [botId, status, router, toast, loadBranches]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleVisibilityChange = (value) => {
		setFormData((prev) => ({ ...prev, visibility: value }));
	};

	const handleExampleChange = (index, field, value) => {
		const updatedExamples = [...formData.examples];
		updatedExamples[index] = { ...updatedExamples[index], [field]: value };
		setFormData((prev) => ({ ...prev, examples: updatedExamples }));
	};

	const addExample = () => {
		setFormData((prev) => ({
			...prev,
			examples: [...prev.examples, { input: "", expectedOutput: "" }],
		}));
	};

	const removeExample = (index) => {
		if (formData.examples.length > 1) {
			const updatedExamples = formData.examples.filter((_, i) => i !== index);
			setFormData((prev) => ({ ...prev, examples: updatedExamples }));
		}
	};

	// Modify the branch selector container with stabilization fixes
	const handleBranchChange = useCallback((branch) => {
		setCurrentBranch(branch);
	}, []);

	const handleCreateBranch = async (branchName, sourceBranchId) => {
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
					sourceBranchId: sourceBranchId || currentBranch?._id,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create branch");
			}

			const newBranch = await response.json();
			setCurrentBranch(newBranch);

			// Refresh branches list
			await loadBranches();

			toast({
				title: "Success",
				description: `Branch "${branchName}" created successfully`,
			});
		} catch (error) {
			console.error("Error creating branch:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to create branch",
				variant: "destructive",
			});
		}
	};

	// Memoize the branch selector to prevent unnecessary re-renders
	const branchSelectorComponent = useMemo(() => {
		return currentBranch ? (
			<BranchSelector
				key={`branch-selector-${currentBranch._id}`}
				botId={botId}
				currentBranch={currentBranch}
				onBranchChange={handleBranchChange}
				onCreateBranch={handleCreateBranch}
			/>
		) : (
			<span className="text-sm font-medium">Loading branches...</span>
		);
	}, [currentBranch, botId, handleBranchChange, handleCreateBranch]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.description.trim()) {
			toast({
				title: "Error",
				description: "Bot description is required",
				variant: "destructive",
			});
			return;
		}

		if (!currentBranch) {
			toast({
				title: "Error",
				description: "Please select a branch to save changes",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);
		let commitId = null;

		try {
			// Prepare model state for the commit
			const modelState = {
				BotName: formData.name,
				Description: formData.description,
				Visibility:
					formData.visibility.charAt(0).toUpperCase() +
					formData.visibility.slice(1),
				SystemPrompt: formData.systemPrompt,
				DefaultParams: {
					Temperature: formData.temperature,
					"Top P": formData.topP,
					ContextWindow: formData.contextMessagesCount,
				},
				TestCases: formData.examples.map((example) => ({
					input: example.input,
					output: example.expectedOutput,
				})),
			};

			// Create a commit with the changes - FIRST
			const commitResponse = await fetch(`/api/bots/${botId}/commits`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					branchId: currentBranch._id,
					message: `Updated ${formData.name} settings`,
					modelState: modelState,
				}),
			});

			if (!commitResponse.ok) {
				const error = await commitResponse.json();
				throw new Error(error.message || "Failed to create commit");
			}

			const commitData = await commitResponse.json();
			commitId = commitData._id;

			// Regular bot update - SECOND (this will update the bot's metadata in the database)
			const { name, ...updateData } = formData; // Remove name from the update data
			await updateBot(botId, updateData);

			toast({
				title: "Success",
				description: `Bot updated successfully on branch "${currentBranch.name}"`,
			});

			// Navigate back to the bot page with the branch selected and versions tab active
			router.push(
				`/bots/${botId}?branchId=${currentBranch._id}&tab=git&commitId=${commitId}`
			);
		} catch (error) {
			console.error("Error updating bot:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to update bot. Please try again.",
				variant: "destructive",
			});
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<h2 className="mt-4 text-xl font-semibold">Loading bot data...</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="container px-4 py-8 mx-auto max-w-[90%]">
			<div className="mb-6">
				<h1 className="text-3xl font-bold mb-2">Edit Bot</h1>
				<p className="text-muted-foreground">Update your bot's configuration</p>
			</div>

			{/* Branch Selector */}
			<div className="mb-6 flex items-center gap-2 min-h-[40px]">
				<GitBranch className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm text-muted-foreground">Current branch:</span>
				<div className="flex-shrink-0">{branchSelectorComponent}</div>
				<div className="ml-2 text-sm text-muted-foreground">
					<span className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-yellow-800 dark:text-yellow-300">
						Changes will be committed to the selected branch
					</span>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				{/* Basic information card */}
				<Card className="mb-8">
					<CardContent className="pt-6 space-y-6">
						<div className="grid gap-3">
							<Label htmlFor="name" className="flex items-center gap-2">
								Bot Name
								<span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-sm">
									Cannot be changed
								</span>
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								disabled
								className="bg-muted/50 cursor-not-allowed"
							/>
							<p className="text-xs text-muted-foreground">
								Bot names cannot be changed after creation to maintain
								consistent references.
							</p>
						</div>

						<div className="grid gap-3">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="A brief description of what this bot does"
								value={formData.description}
								onChange={handleChange}
								maxLength={200}
								className="resize-none h-20"
							/>
						</div>

						<div className="grid gap-3">
							<Label>Visibility</Label>
							<RadioGroup
								value={formData.visibility}
								onValueChange={handleVisibilityChange}
								className="flex space-x-4"
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="Public" id="Public" />
									<Label htmlFor="Public" className="cursor-pointer">
										Public
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="Private" id="Private" />
									<Label htmlFor="Private" className="cursor-pointer">
										Private
									</Label>
								</div>
							</RadioGroup>
							<p className="text-sm text-muted-foreground">
								{formData.visibility === "Public"
									? "Anyone can view and use this bot"
									: "Only you can access this bot"}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* System Prompt Card */}
				<Card className="mb-8">
					<CardContent className="pt-6 space-y-6">
						<div className="grid gap-3">
							<Label htmlFor="systemPrompt">Base System Prompt</Label>
							<Textarea
								id="systemPrompt"
								name="systemPrompt"
								placeholder="You are a helpful assistant that..."
								value={formData.systemPrompt}
								onChange={handleChange}
								className="resize-none h-32"
							/>
							<p className="text-sm text-muted-foreground">
								This defines your bot's personality and behavior
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="mb-8">
					<CardContent className="pt-6 space-y-6">
						<h3 className="text-lg font-medium">LLM Parameters</h3>
						<p className="text-sm text-muted-foreground">
							Configure how the language model generates responses
						</p>

						<div className="grid gap-6">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="temperature">
										Temperature: {formData.temperature}
									</Label>
									<span className="text-sm text-muted-foreground">
										{formData.temperature === 0
											? "More deterministic"
											: formData.temperature >= 1
											? "More random/creative"
											: "Balanced"}
									</span>
								</div>
								<input
									id="temperature"
									type="range"
									min="0"
									max="1"
									step="0.1"
									value={formData.temperature}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											temperature: parseFloat(e.target.value),
										}))
									}
									className="w-full"
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="topP">Top P: {formData.topP}</Label>
									<span className="text-sm text-muted-foreground">
										{formData.topP <= 0.5
											? "More focused"
											: formData.topP >= 0.9
											? "More diverse"
											: "Balanced"}
									</span>
								</div>
								<input
									id="topP"
									type="range"
									min="0.1"
									max="1"
									step="0.1"
									value={formData.topP}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											topP: parseFloat(e.target.value),
										}))
									}
									className="w-full"
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="contextMessagesCount">
										Context Messages: {formData.contextMessagesCount}
									</Label>
									<span className="text-sm text-muted-foreground">
										Number of previous messages to include
									</span>
								</div>
								<input
									id="contextMessagesCount"
									type="range"
									min="1"
									max="5"
									step="1"
									value={formData.contextMessagesCount}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											contextMessagesCount: parseInt(e.target.value),
										}))
									}
									className="w-full"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="mb-8">
					<CardContent className="pt-6 space-y-6">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Test-case Examples</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addExample}
								className="gap-1"
							>
								<Plus className="h-4 w-4" /> Add Example
							</Button>
						</div>

						<div className="space-y-6">
							{formData.examples.map((example, index) => (
								<div
									key={index}
									className="p-4 border rounded-md bg-muted/30 relative"
								>
									<div className="grid gap-3 mb-4">
										<Label htmlFor={`input-${index}`}>User Input</Label>
										<Textarea
											id={`input-${index}`}
											value={example.input}
											onChange={(e) =>
												handleExampleChange(index, "input", e.target.value)
											}
											placeholder="What user might ask..."
											className="resize-none h-20"
										/>
									</div>

									<div className="grid gap-3">
										<Label htmlFor={`output-${index}`}>Expected Output</Label>
										<Textarea
											id={`output-${index}`}
											value={example.expectedOutput}
											onChange={(e) =>
												handleExampleChange(
													index,
													"expectedOutput",
													e.target.value
												)
											}
											placeholder="How your bot should respond..."
											className="resize-none h-20"
										/>
									</div>

									{formData.examples.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => removeExample(index)}
											className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<div className="flex gap-4 justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push(`/bots/${botId}`)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting || !currentBranch}
						className="gap-1"
					>
						{isSubmitting ? "Saving..." : "Update Bot"}
					</Button>
				</div>
			</form>
		</div>
	);
}
