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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Edit, Trash2, AlertTriangle } from "lucide-react";
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

export default function BotPage({ params }) {
	const router = useRouter();
	const { status, user } = useAuth(); // user.id should be available
	const { toast } = useToast();
	const botId = params.id;

	const [bot, setBot] = useState(null);
	const [isOwner, setIsOwner] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	useEffect(() => {
		const loadBot = async () => {
			try {
				const botData = await getBotById(botId);
				if (botData) {
					setBot({ ...botData, id: botData._id.toString() }); // Ensure ID is a string

					// Check if current user is the owner
					if (
						status === "authenticated" &&
						user &&
						botData.userId.toString() === user.id
					) {
						setIsOwner(true);
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
		router.push(`/bots/${botId}/edit`);
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

	// Show not authorized message if bot is private and user is not owner
	if (!isLoading && bot && !isOwner && bot.visibility === "private") {
		return (
			<div className="container px-4 py-16 mx-auto max-w-4xl">
				<Card className="border-destructive">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
							<AlertTriangle className="h-12 w-12 text-destructive" />
							<h2 className="text-2xl font-bold">Not Authorized</h2>
							<p className="text-muted-foreground max-w-md">
								This bot is private and only accessible to its owner.
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
			<div className="container px-4 py-16 mx-auto max-w-4xl">
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
		<div className="container px-4 py-8 mx-auto max-w-4xl">
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
				</div>

				<div className="flex gap-3">
					<Button onClick={handleChatWithBot} className="gap-1">
						<MessageSquare className="h-4 w-4" /> Chat with this Bot
					</Button>

					{isOwner && (
						<>
							<Button
								variant="outline"
								onClick={handleEditBot}
								className="gap-1"
							>
								<Edit className="h-4 w-4" /> Edit
							</Button>
							<Button
								variant="destructive"
								onClick={() => setShowDeleteDialog(true)}
								className="gap-1"
							>
								<Trash2 className="h-4 w-4" /> Delete
							</Button>
						</>
					)}
				</div>
			</div>

			<Tabs defaultValue="details" className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="examples">Examples</TabsTrigger>
				</TabsList>

				<TabsContent value="details">
					<Card>
						<CardHeader>
							<CardTitle>System Prompt</CardTitle>
							<CardDescription>
								Base instructions that define this bot's behavior
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap">
								{bot.systemPrompt || "No system prompt defined."}
							</div>
						</CardContent>
					</Card>
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
