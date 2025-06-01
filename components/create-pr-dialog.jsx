"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, GitPullRequest, Loader2 } from "lucide-react";

export function CreatePRDialog({ botId, currentBranch, trigger }) {
	const router = useRouter();
	const { toast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [branches, setBranches] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		sourceBranchId: "",
		targetBranchId: "",
	});

	// Load all branches when dialog opens
	useEffect(() => {
		if (!isOpen || !botId) return;

		const fetchBranches = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(`/api/bots/${botId}/branches`);
				if (!response.ok) throw new Error("Failed to load branches");

				const data = await response.json();
				setBranches(data);

				// Identify default branch
				const defaultBranch = data.find((b) => b.isDefault);

				// If current branch is provided but it's the default branch,
				// don't pre-select it as source (since we don't allow creating PRs from master)
				if (currentBranch && !currentBranch.isDefault) {
					setFormData((prev) => ({
						...prev,
						sourceBranchId: currentBranch._id,
						// Default target to the default branch if not the current branch
						targetBranchId:
							data.find((b) => b.isDefault && b._id !== currentBranch._id)
								?._id || "",
					}));
				} else if (defaultBranch) {
					// If current branch is default or not provided, set target to default branch
					// but don't set a source branch
					setFormData((prev) => ({
						...prev,
						targetBranchId: defaultBranch._id,
					}));
				}
			} catch (error) {
				console.error("Error fetching branches:", error);
				setError("Failed to load branches. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchBranches();
	}, [isOpen, botId, currentBranch]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Basic validation
		if (
			!formData.title.trim() ||
			!formData.sourceBranchId ||
			!formData.targetBranchId
		) {
			toast({
				title: "Validation Error",
				description: "Please fill in all required fields.",
				variant: "destructive",
			});
			return;
		}

		// Prevent creating PR to the same branch
		if (formData.sourceBranchId === formData.targetBranchId) {
			toast({
				title: "Invalid Selection",
				description: "Source and target branches must be different.",
				variant: "destructive",
			});
			return;
		}

		// Prevent creating PR from master/default branch
		const sourceBranch = branches.find(
			(b) => b._id === formData.sourceBranchId
		);
		if (sourceBranch && sourceBranch.isDefault) {
			toast({
				title: "Invalid Source Branch",
				description:
					"Cannot create pull requests from the master branch. Please select a different source branch.",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch(`/api/bots/${botId}/prs`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to create pull request");
			}

			toast({
				title: "Success",
				description: "Pull request created successfully!",
			});

			// Close dialog and redirect to the new PR
			setIsOpen(false);
			router.push(`/bots/${botId}/prs/${data._id}`);
		} catch (error) {
			console.error("Error creating PR:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to create pull request",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<GitPullRequest className="h-5 w-5" />
						Create Pull Request
					</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="py-6 flex flex-col items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin mb-2" />
						<p>Loading branches...</p>
					</div>
				) : error ? (
					<div className="py-6 text-center">
						<AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
						<p className="text-destructive">{error}</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => setIsOpen(false)}
						>
							Close
						</Button>
					</div>
				) : (
					<form onSubmit={handleSubmit}>
						<div className="grid gap-4 py-4">
							{/* Branch selection */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="sourceBranchId">Source Branch</Label>
									<Select
										value={formData.sourceBranchId}
										onValueChange={(value) =>
											setFormData((prev) => ({
												...prev,
												sourceBranchId: value,
											}))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select source branch" />
										</SelectTrigger>
										<SelectContent>
											{branches
												.filter((branch) => !branch.isDefault) // Filter out the default branch
												.map((branch) => (
													<SelectItem key={branch._id} value={branch._id}>
														{branch.name}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
									{branches.length > 0 &&
										branches.every((b) => b.isDefault) && (
											<p className="text-xs text-destructive mt-1">
												You need to create a non-master branch first before
												creating a PR.
											</p>
										)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="targetBranchId">Target Branch</Label>
									<Select
										value={formData.targetBranchId}
										onValueChange={(value) =>
											setFormData((prev) => ({
												...prev,
												targetBranchId: value,
											}))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select target branch" />
										</SelectTrigger>
										<SelectContent>
											{branches
												.filter((b) => b._id !== formData.sourceBranchId)
												.map((branch) => (
													<SelectItem key={branch._id} value={branch._id}>
														{branch.name} {branch.isDefault && "(default)"}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Title and description */}
							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									name="title"
									value={formData.title}
									onChange={handleChange}
									placeholder="Summarize your changes"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description (optional)</Label>
								<Textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Provide additional context about your changes"
									rows={4}
								/>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting} className="gap-1">
								{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
								{isSubmitting ? "Creating..." : "Create Pull Request"}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
