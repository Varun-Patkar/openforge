import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, Edit, Eye, Trash2 } from "lucide-react"; // Import Lock from lucide-react instead
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBot } from "@/lib/api";
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
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BotCard({ bot, isOwner, showAccess = false }) {
	const router = useRouter();
	const { toast } = useToast();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isCreatingChat, setIsCreatingChat] = useState(false);

	const timeAgo = bot.createdAt
		? formatDistanceToNow(new Date(bot.createdAt), { addSuffix: true })
		: "recently";

	const handleChatWithBot = async (e) => {
		e.preventDefault();

		if (isCreatingChat) return;

		setIsCreatingChat(true);
		try {
			// Create a new chat with current date/time as title
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
		} finally {
			setIsCreatingChat(false);
		}
	};

	const handleDelete = async () => {
		if (isDeleting) return;

		setIsDeleting(true);
		try {
			await deleteBot(bot.id);
			toast({
				title: "Success",
				description: "Bot has been deleted successfully",
			});
			// Refresh the page or redirect
			router.refresh(); // This refreshes the current route
		} catch (error) {
			console.error("Error deleting bot:", error);
			toast({
				title: "Error",
				description: "Failed to delete the bot",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	const formattedDate = bot.createdAt
		? new Date(bot.createdAt).toLocaleString("default", {
				year: "numeric",
				month: "short",
				day: "numeric",
		  })
		: "Unknown date";

	return (
		<>
			<Card
				className={cn(
					"hover:shadow-md transition-all border",
					bot.visibility === "private" && "border-muted-foreground/10"
				)}
			>
				<CardHeader className="space-y-1">
					<div className="flex justify-between items-start gap-2">
						<Link href={`/bots/${bot.id}`} className="hover:underline">
							<CardTitle className="text-xl">{bot.name}</CardTitle>
						</Link>
						<div className="flex items-center gap-1">
							{bot.visibility === "private" && (
								<Badge variant="outline" className="flex gap-1 text-xs">
									<Lock className="h-3 w-3" />
									Private
								</Badge>
							)}
							{bot.visibility === "public" && (
								<Badge variant="secondary" className="text-xs">
									Public
								</Badge>
							)}
						</div>
					</div>

					<CardDescription className="line-clamp-2">
						{bot.description || "No description provided"}
					</CardDescription>

					{/* Show access information for private bots */}
					{showAccess && bot.visibility === "private" && (
						<div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
							<span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
								{bot.isCollaborator ? "Collaborator" : "Owner"}
							</span>
						</div>
					)}

					{/* Add creator information with profile link */}
					{bot.creator && (
						<div className="flex items-center mt-1 text-xs text-muted-foreground">
							<span className="mr-1">By:</span>
							<Link
								href={`/profile/${bot.creator._id || bot.userId}`}
								className="flex items-center hover:text-primary transition-colors"
							>
								<Avatar className="h-4 w-4 mr-1">
									<AvatarImage
										src={bot.creator.image}
										alt={bot.creator.name || "Creator"}
									/>
									<AvatarFallback className="text-[10px]">
										{bot.creator.name
											? bot.creator.name.charAt(0).toUpperCase()
											: "U"}
									</AvatarFallback>
								</Avatar>
								<span>{bot.creator.name || "Anonymous User"}</span>
							</Link>
						</div>
					)}
				</CardHeader>
				<CardFooter className="border-t p-4 pt-3 gap-2 flex">
					<Button
						onClick={handleChatWithBot}
						className="flex-1 gap-1"
						variant="default"
						size="sm"
						disabled={isCreatingChat}
					>
						<MessageSquare className="h-4 w-4" />
						{isCreatingChat ? "Creating..." : "Chat"}
					</Button>

					<Button
						asChild
						className="flex-1 gap-1"
						variant="secondary"
						size="sm"
					>
						<Link href={`/bots/${bot.id}`}>
							<Eye className="h-4 w-4" /> View
						</Link>
					</Button>

					{isOwner && (
						<>
							<Button
								asChild
								className="flex-1 gap-1"
								variant="outline"
								size="sm"
							>
								<Link href={`/bots/${bot.id}/edit`}>
									<Edit className="h-4 w-4" /> Edit
								</Link>
							</Button>

							{/* Delete button - only shown if isOwner is true */}
							<Button
								className="flex-1 gap-1"
								variant="outline"
								size="sm"
								onClick={() => setShowDeleteDialog(true)}
							>
								<Trash2 className="h-4 w-4 text-destructive" /> Delete
							</Button>
						</>
					)}
				</CardFooter>
			</Card>

			{/* Delete confirmation dialog */}
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
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Read-only mode message */}
			{bot.isReadOnly && (
				<div className="mt-2 text-center text-sm text-muted-foreground">
					<span>This bot is in &quot;read-only&quot; mode.</span>
				</div>
			)}
		</>
	);
}
