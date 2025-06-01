"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Trash2, User } from "lucide-react";
import Link from "next/link";

export function CollaboratorManagement({ botId, isOwner }) {
	const { toast } = useToast();
	const [collaborators, setCollaborators] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [showAddDialog, setShowAddDialog] = useState(false);

	useEffect(() => {
		if (botId) {
			loadCollaborators();
		}
	}, [botId]);

	const loadCollaborators = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/bots/${botId}/collaborators`);
			if (response.ok) {
				const data = await response.json();
				setCollaborators(data || []);
			} else {
				const error = await response.json();
				toast({
					title: "Error",
					description: error.message || "Failed to load collaborators",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error loading collaborators:", error);
			toast({
				title: "Error",
				description: "Failed to load collaborators",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddCollaborator = async (e) => {
		e.preventDefault();
		if (!newCollaboratorEmail.trim()) return;

		try {
			setIsAdding(true);
			const response = await fetch(`/api/bots/${botId}/collaborators`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: newCollaboratorEmail }),
			});

			if (response.ok) {
				const collaborator = await response.json();
				setCollaborators((prev) => [...prev, collaborator]);
				setNewCollaboratorEmail("");
				setShowAddDialog(false);
				toast({
					title: "Success",
					description: "Collaborator added successfully",
				});
			} else {
				const error = await response.json();
				toast({
					title: "Error",
					description: error.message || "Failed to add collaborator",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error adding collaborator:", error);
			toast({
				title: "Error",
				description: "Failed to add collaborator",
				variant: "destructive",
			});
		} finally {
			setIsAdding(false);
		}
	};

	const handleRemoveCollaborator = async (userId) => {
		try {
			const response = await fetch(
				`/api/bots/${botId}/collaborators?userId=${userId}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				setCollaborators((prev) =>
					prev.filter((c) => c.userId.toString() !== userId.toString())
				);
				toast({
					title: "Success",
					description: "Collaborator removed successfully",
				});
			} else {
				const error = await response.json();
				toast({
					title: "Error",
					description: error.message || "Failed to remove collaborator",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error removing collaborator:", error);
			toast({
				title: "Error",
				description: "Failed to remove collaborator",
				variant: "destructive",
			});
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="animate-pulse space-y-3">
						<div className="h-5 bg-muted rounded w-1/3"></div>
						<div className="h-10 bg-muted rounded w-full"></div>
						<div className="h-20 bg-muted rounded w-full"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between">
				<div>
					<CardTitle>Collaborators</CardTitle>
					<CardDescription>
						Manage who can edit and contribute to this bot
					</CardDescription>
				</div>

				{isOwner && (
					<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
						<DialogTrigger asChild>
							<Button size="sm" className="ml-auto gap-1">
								<UserPlus className="h-4 w-4" /> Add Collaborator
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add Collaborator</DialogTitle>
								<DialogDescription>
									Add someone by email to collaborate on this bot. They will be
									able to edit, create branches, and make changes.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleAddCollaborator}>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<label htmlFor="email" className="text-sm font-medium">
											Email Address
										</label>
										<Input
											id="email"
											placeholder="collaborator@example.com"
											type="email"
											value={newCollaboratorEmail}
											onChange={(e) => setNewCollaboratorEmail(e.target.value)}
											required
										/>
									</div>
								</div>
								<DialogFooter>
									<Button type="submit" disabled={isAdding}>
										{isAdding ? "Adding..." : "Add Collaborator"}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				)}
			</CardHeader>

			<CardContent>
				{collaborators.length === 0 ? (
					<div className="text-center py-6 text-muted-foreground">
						No collaborators added yet
					</div>
				) : (
					<div className="space-y-3">
						{collaborators.map((collaborator) => (
							<div
								key={collaborator.userId}
								className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
							>
								<Link
									href={`/profile/${collaborator.userId}`}
									className="flex items-center gap-3 hover:text-primary transition-colors"
								>
									<Avatar>
										<AvatarImage
											src={collaborator.image}
											alt={collaborator.name}
										/>
										<AvatarFallback>
											{collaborator.name
												? collaborator.name.charAt(0).toUpperCase()
												: null}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{collaborator.name}</p>
										<p className="text-sm text-muted-foreground">
											{collaborator.email}
										</p>
									</div>
								</Link>
								{isOwner && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() =>
											handleRemoveCollaborator(collaborator.userId)
										}
										className="h-8 w-8 text-muted-foreground hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>

			<CardFooter className="border-t pt-6 mt-2">
				<div className="text-sm text-muted-foreground">
					<p>
						<strong>Collaborators can:</strong> View, chat, edit, create
						branches, and make commits.
					</p>
					<p className="mt-1">
						<strong>Only the owner can:</strong> Delete the bot and manage
						collaborators.
					</p>
				</div>
			</CardFooter>
		</Card>
	);
}
