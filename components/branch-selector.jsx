"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	GitBranch,
	Plus,
	Check,
	Trash2,
	ChevronDown,
	GitPullRequest,
	Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { useRouter } from "next/navigation";

export function BranchSelector({
	botId,
	currentBranch,
	onBranchChange,
	onBranchDelete,
	onCreateBranch,
}) {
	const [branches, setBranches] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showNewBranchDialog, setShowNewBranchDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [branchToDelete, setBranchToDelete] = useState(null);
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		if (!botId) return;

		const fetchBranches = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`/api/bots/${botId}/branches`);
				if (!response.ok) {
					throw new Error("Failed to fetch branches");
				}
				const data = await response.json();
				setBranches(data);

				// If no current branch is selected, select the default branch
				if (!currentBranch && data.length > 0) {
					const defaultBranch = data.find((b) => b.isDefault) || data[0];
					if (onBranchChange) {
						onBranchChange(defaultBranch);
					}
				}
			} catch (error) {
				console.error("Error fetching branches:", error);
				toast({
					title: "Error",
					description: "Failed to load branches",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchBranches();
	}, [botId, currentBranch, onBranchChange, toast]);

	// Load branches when dropdown is opened
	const loadBranches = async () => {
		try {
			const response = await fetch(`/api/bots/${botId}/branches`);
			if (response.ok) {
				const data = await response.json();
				setBranches(data);
				return data;
			}
		} catch (error) {
			console.error("Failed to load branches:", error);
			toast({
				title: "Error",
				description: "Failed to load branches",
				variant: "destructive",
			});
		}
		return [];
	};

	const handleBranchSelect = (branch) => {
		if (branch._id !== currentBranch?._id) {
			if (typeof onBranchChange === "function") {
				onBranchChange(branch);
			}
		}
	};

	const confirmBranchDelete = (branch, e) => {
		e.stopPropagation(); // Prevent branch selection when clicking delete

		// Don't allow deletion of default branch
		if (branch.isDefault) {
			toast({
				title: "Cannot Delete Default Branch",
				description: "The default branch cannot be deleted.",
				variant: "destructive",
			});
			return;
		}

		setBranchToDelete(branch);
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = () => {
		if (branchToDelete && onBranchDelete) {
			onBranchDelete(branchToDelete._id);
		}
		setBranchToDelete(null);
		setShowDeleteDialog(false);
	};

	const handleCreateBranchSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const branchName = formData.get("branchName");
		const sourceBranchId = formData.get("baseBranch");

		if (!branchName || !sourceBranchId) return;

		// Use the dedicated prop if available
		if (typeof onCreateBranch === "function") {
			onCreateBranch(branchName, sourceBranchId);
		}
		// Fallback to the old structure if onCreateBranch is not provided
		else if (
			onBranchChange &&
			typeof onBranchChange === "object" &&
			typeof onBranchChange.handleCreateBranch === "function"
		) {
			onBranchChange.handleCreateBranch(branchName, sourceBranchId);
		}

		setShowNewBranchDialog(false);
	};

	return (
		<>
			<DropdownMenu onOpenChange={(open) => open && loadBranches()}>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="gap-1">
						<GitBranch className="h-4 w-4" />
						{isLoading
							? "Loading..."
							: currentBranch
							? currentBranch.name
							: "Select Branch"}
						<ChevronDown className="h-3.5 w-3.5 opacity-70 ml-1" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					{branches.map((branch) => (
						<DropdownMenuItem
							key={branch._id}
							onClick={() => handleBranchSelect(branch)}
							className="flex justify-between items-center cursor-pointer"
						>
							<div className="flex items-center gap-2">
								{branch._id === currentBranch?._id && (
									<Check className="h-4 w-4" />
								)}
								<span className={branch.isDefault ? "font-medium" : ""}>
									{branch.name} {branch.isDefault && "(default)"}
								</span>
							</div>

							{!branch.isDefault && (
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 ml-2 opacity-70 hover:opacity-100 hover:text-destructive"
									onClick={(e) => confirmBranchDelete(branch, e)}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							)}
						</DropdownMenuItem>
					))}

					{branches.length === 0 && (
						<DropdownMenuItem disabled>No branches found</DropdownMenuItem>
					)}

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={() => setShowNewBranchDialog(true)}
						className="gap-2"
					>
						<Plus className="h-4 w-4" />
						Create new branch
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() =>
							(window.location.href = `/api/bots/${botId}/download?branchId=${currentBranch._id}`)
						}
						className="gap-2"
					>
						<Download className="h-4 w-4" />
						Download Model
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Create Branch Dialog */}
			<Dialog open={showNewBranchDialog} onOpenChange={setShowNewBranchDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Branch</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreateBranchSubmit}>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="branchName">Branch Name</Label>
								<Input
									id="branchName"
									name="branchName"
									placeholder="feature/my-new-feature"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="baseBranch">Based On</Label>
								<select
									id="baseBranch"
									name="baseBranch"
									className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									defaultValue={currentBranch?._id}
								>
									{branches.map((branch) => (
										<option key={branch._id} value={branch._id}>
											{branch.name} {branch.isDefault ? "(default)" : ""}
										</option>
									))}
								</select>
								<p className="text-sm text-muted-foreground">
									The new branch will start with the same content as the
									selected branch
								</p>
							</div>
						</div>
						<DialogFooter>
							<Button type="submit">Create Branch</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Branch Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Branch</AlertDialogTitle>
						<AlertDialogDescription>
							<p>
								Are you sure you want to delete &quot;{branchToDelete?.name}
								&quot;? This action cannot be undone and all commits specific to
								this branch will be lost.
							</p>
							{branchToDelete?.isDefault && (
								<p className="text-sm text-muted-foreground">
									You can&apos;t delete the default branch.
								</p>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
