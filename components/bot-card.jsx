import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit, Trash2 } from "lucide-react";
import { createChat } from "@/lib/chat-api";

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
			className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
			onClick={() => router.push(`/bots/${bot.id}`)}
		>
			<CardContent className="p-4">
				<div className="flex justify-between items-start mb-2">
					<div>
						<h3 className="font-medium text-lg">{bot.name}</h3>
						<p className="text-sm text-muted-foreground line-clamp-2">
							{bot.description || "No description provided."}
						</p>
					</div>
					<Badge
						variant={bot.visibility === "public" ? "secondary" : "outline"}
						className="ml-2 mt-1"
					>
						{bot.visibility}
					</Badge>
				</div>
			</CardContent>
			<CardFooter className="p-4 pt-0 flex gap-2 justify-between">
				<Button
					variant="default"
					size="sm"
					className="gap-1"
					onClick={handleChatClick}
				>
					<MessageSquare className="h-4 w-4" /> Chat
				</Button>

				{isOwner && (
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							className="gap-1"
							onClick={handleEditClick}
						>
							<Edit className="h-4 w-4" /> Edit
						</Button>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
