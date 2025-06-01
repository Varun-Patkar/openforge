import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Edit, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createChat } from "@/lib/chat-api";
import { useToast } from "@/hooks/use-toast";

export default function BotCard({ bot, isOwner }) {
	const router = useRouter();
	const { toast } = useToast();

	// Always create a new chat when "Chat" is clicked
	const handleChatClick = async (e) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			// Create a new chat with current date/time as title
			const title = new Date().toLocaleString();
			const newChat = await createChat(bot.id, title);

			// Navigate to new chat
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

	const handleEditClick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		router.push(`/bots/${bot.id}/edit`);
	};

	return (
		<Card
			className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
			onClick={() => router.push(`/bots/${bot.id}`)}
		>
			<CardContent className="p-5">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-lg truncate">{bot.name}</h3>
						<Badge
							variant={bot.visibility === "public" ? "secondary" : "outline"}
						>
							{bot.visibility}
						</Badge>
					</div>

					<p className="text-sm text-muted-foreground line-clamp-2">
						{bot.description || "No description provided."}
					</p>

					{/* Creator information */}
					{bot.creator && (
						<div className="flex items-center mt-1 text-xs text-muted-foreground">
							<Avatar className="h-5 w-5 mr-1">
								<AvatarImage
									src={bot.creator.image}
									alt={bot.creator.name || "Creator"}
								/>
								<AvatarFallback>
									{bot.creator.name ? (
										bot.creator.name.charAt(0).toUpperCase()
									) : (
										<User className="h-3 w-3" />
									)}
								</AvatarFallback>
							</Avatar>
							<span>{bot.creator.name || "Anonymous User"}</span>
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="p-3 bg-muted/30 border-t flex justify-between">
				<Button
					variant="default"
					size="sm"
					className="gap-1"
					onClick={handleChatClick}
				>
					<MessageSquare className="h-4 w-4" />
					Chat
				</Button>

				{isOwner && (
					<Button
						variant="outline"
						size="sm"
						className="gap-1"
						onClick={handleEditClick}
					>
						<Edit className="h-4 w-4" />
						Edit
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
