import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, Edit, Eye, Trash2 } from "lucide-react";
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

export default function BotCard({ bot, isOwner }) {
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

	return (
		<>
			<Card className="group h-full flex flex-col hover:shadow-md transition-shadow overflow-hidden">
				<CardContent className="p-6 pt-2 flex-1 pb-2">
					<div className="mb-1 flex items-center gap-2">
						<div className="p-2 rounded-md bg-primary/10">
							<Bot className="h-5 w-5 text-primary" />
						</div>
						<h3 className="font-semibold text-xl line-clamp-1">{bot.name}</h3>
					</div>

					{/* Tags on separate line */}
					<div className="flex flex-wrap gap-2 mb-3">
						<Badge
							variant={bot.visibility === "public" ? "secondary" : "outline"}
						>
							{bot.visibility}
						</Badge>
						{bot.tags &&
							bot.tags.map((tag) => (
								<Badge key={tag} variant="outline">
									{tag}
								</Badge>
							))}
					</div>

					<p className="text-sm text-muted-foreground line-clamp-3 flex-grow">
						{bot.description || "No description provided."}
					</p>
				</CardContent>

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
		</>
	);
}
