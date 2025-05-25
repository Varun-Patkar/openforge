"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { getBotById, fetchUserBots } from "@/lib/api";
import { createChat } from "@/lib/chat-api";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Search, Plus } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NewChatPage() {
	const router = useRouter();
	const { status } = useAuth();
	const { toast } = useToast();

	const [bots, setBots] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
		} else if (status === "authenticated") {
			loadBots();
		}
	}, [status, router]);

	const loadBots = async () => {
		try {
			setIsLoading(true);
			const userBots = await fetchUserBots();
			setBots(userBots);
		} catch (error) {
			console.error("Error loading bots:", error);
			toast({
				title: "Error",
				description: "Failed to load your bots",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleNewChat = async (botId) => {
		try {
			// Default title using current date/time
			const defaultTitle = format(new Date(), "MMM d, yyyy h:mm a");
			const newChat = await createChat({ botId, title: defaultTitle });
			router.push(`/chat/${newChat.id}`);
		} catch (error) {
			console.error("Error creating chat:", error);
			toast({
				title: "Error",
				description: "Failed to start new chat",
				variant: "destructive",
			});
		}
	};

	const filteredBots = bots.filter(
		(bot) =>
			bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			bot.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (status === "loading" || isLoading) {
		return (
			<div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
				<div className="w-full max-w-3xl">
					<div className="animate-pulse space-y-6">
						<Skeleton className="h-10 w-48 mx-auto" />
						<Skeleton className="h-6 w-full max-w-md mx-auto" />
						<Skeleton className="h-12 w-full max-w-sm mx-auto" />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="h-40 w-full rounded-xl" />
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto flex flex-col p-4 h-full">
			<div className="max-w-3xl mx-auto w-full pb-6 pt-10 text-center space-y-4">
				<h1 className="text-3xl font-bold">Start a New Chat</h1>
				<p className="text-muted-foreground">
					Select a bot to begin a conversation
				</p>

				<div className="relative max-w-md mx-auto mt-4">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search your bots..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			<ScrollArea className="flex-1 px-4">
				{filteredBots.length === 0 ? (
					<div className="text-center p-10">
						<p className="text-muted-foreground mb-4">
							{bots.length === 0
								? "You don't have any bots yet."
								: "No bots match your search."}
						</p>
						<Button onClick={() => router.push("/bots/new")}>
							<Plus className="mr-2 h-4 w-4" /> Create Your First Bot
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
						{filteredBots.map((bot) => (
							<Card
								key={bot.id}
								className="cursor-pointer hover:shadow-md transition-shadow"
								onClick={() => handleNewChat(bot.id)}
							>
								<CardHeader>
									<CardTitle className="text-lg">{bot.name}</CardTitle>
									<CardDescription className="line-clamp-2">
										{bot.description || "No description provided."}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button className="w-full gap-2">
										<MessageCircle className="h-4 w-4" /> Start Chat
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</ScrollArea>
		</div>
	);
}
