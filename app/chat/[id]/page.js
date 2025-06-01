"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	MessageSquarePlus,
	Send,
	Bot,
	User,
	Edit2,
	Trash2,
	Check,
	X,
	Loader2,
	Plus,
	Settings,
	RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePreferences } from "@/context/preferences-context";
import {
	fetchChat,
	fetchUserChats,
	createChat,
	updateMessages,
	renameChat,
	deleteChat,
	sendMessage,
} from "@/lib/chat-api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

// Import WebLLM components - these would be in a separate file in reality
import dynamic from "next/dynamic";
const WebLLMProvider = dynamic(() => import("@/components/webllm-provider"), {
	ssr: false,
	loading: () => (
		<div className="animate-pulse text-center">Loading WebLLM engine...</div>
	),
});
import { GitCommit } from "lucide-react";

export default function ChatPage({ params }) {
	const router = useRouter();
	const { status } = useAuth();
	const { preferences, getActivePreferenceDetails } = usePreferences();
	const { toast } = useToast();

	const chatId = params.id;
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);

	const [chat, setChat] = useState(null);
	const [botId, setBotId] = useState(null);
	const [botName, setBotName] = useState("");
	const [chatHistory, setChatHistory] = useState([]);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [activePreference, setActivePreference] = useState(null);
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [editTitle, setEditTitle] = useState("");
	const [isCreatingChat, setIsCreatingChat] = useState(false);

	// Bot settings
	const [botSettings, setBotSettings] = useState(null);

	// Chat settings (temporary adjustments)
	const [chatSettings, setChatSettings] = useState({
		temperature: 0.7,
		topP: 0.9,
		contextMessagesCount: 3,
	});

	const [showSettingsDialog, setShowSettingsDialog] = useState(false);

	// Model loading state
	const [isModelLoading, setIsModelLoading] = useState(false);
	const [modelLoadingStatus, setModelLoadingStatus] = useState("");
	const [modelError, setModelError] = useState(null);

	// Commit info state
	const [commitInfo, setCommitInfo] = useState(null);

	// Load chat data and bot details
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
		} else if (status === "authenticated" && chatId) {
			loadChat();
		}
	}, [status, chatId, router]);

	// Get active preference when component loads
	useEffect(() => {
		const preference = getActivePreferenceDetails();
		setActivePreference(preference);
	}, [getActivePreferenceDetails]);

	// Scroll to bottom on new messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Initialize chat settings from bot settings
	useEffect(() => {
		if (botSettings) {
			setChatSettings({
				temperature: botSettings.temperature || 0.7,
				topP: botSettings.topP || 0.9,
				contextMessagesCount: botSettings.contextMessagesCount || 3,
			});
		}
	}, [botSettings]);

	const loadChat = async () => {
		try {
			setIsLoading(true);
			const chatData = await fetchChat(chatId);

			if (!chatData) {
				toast({
					title: "Error",
					description: "Chat not found",
					variant: "destructive",
				});
				router.push("/dashboard");
				return;
			}

			setChat(chatData);
			setMessages(chatData.messages || []);
			setEditTitle(chatData.title || "");
			setBotId(chatData.botId);

			// If chat has a commitId, fetch commit info
			if (chatData.commitId) {
				try {
					const commitData = await fetch(
						`/api/bots/${chatData.botId}/commits/${chatData.commitId}`
					).then((r) => r.json());
					setCommitInfo(commitData);
				} catch (error) {
					console.error("Error fetching commit info:", error);
				}
			}

			if (chatData.bot) {
				setBotName(chatData.bot.name || "AI Assistant");

				// Load bot settings
				setBotSettings({
					temperature: chatData.bot.temperature || 0.7,
					topP: chatData.bot.topP || 0.9,
					contextMessagesCount: chatData.bot.contextMessagesCount || 3,
					systemPrompt: chatData.bot.systemPrompt || "",
				});
			}

			// Always load chat history for this bot
			await loadChatHistory(chatData.botId);
		} catch (error) {
			console.error("Error loading chat:", error);
			toast({
				title: "Error",
				description: "Failed to load chat",
				variant: "destructive",
			});
			// Redirect to dashboard on error
			router.push("/dashboard");
		} finally {
			setIsLoading(false);
		}
	};

	// Modify loadChatHistory to handle the case where no chats exist
	const loadChatHistory = async (botId) => {
		if (!botId) return;

		try {
			const chats = await fetchUserChats(botId);
			setChatHistory(chats || []);
		} catch (error) {
			console.error("Error loading chat history:", error);
			setChatHistory([]); // Set empty array on error instead of showing an error toast
		}
	};

	// Handle WebLLM loading status changes
	const handleModelLoadingChange = (
		isLoading,
		statusMessage,
		isError = false
	) => {
		setIsModelLoading(isLoading);
		setModelLoadingStatus(statusMessage || "");
		if (isError) {
			setModelError(statusMessage);
			toast({
				title: "Model Error",
				description: statusMessage,
				variant: "destructive",
			});
		} else {
			setModelError(null);
		}
	};

	const handleSendMessage = async (e) => {
		e?.preventDefault();

		if (!input.trim() || !chatId || isModelLoading) return;

		// Add user message to UI immediately
		const userMessage = { role: "user", content: input };
		const updatedMessages = [...messages, userMessage];
		setMessages(updatedMessages);
		setInput("");
		setIsSending(true);

		try {
			// Process based on LLM preference type
			if (activePreference?.type === "webllm") {
				// WebLLM is handled client-side by the WebLLMProvider
				// We'll save the messages to DB after the WebLLM component generates a response

				// Also save the user message to the database
				await updateMessages(chatId, updatedMessages);
			} else {
				// API-based LLM
				const response = await sendMessage(chatId, input, chatSettings);

				// Update messages with assistant response
				const assistantMessage = {
					role: "assistant",
					content: response.response,
				};

				setMessages([...updatedMessages, assistantMessage]);
			}
		} catch (error) {
			console.error("Error processing message:", error);
			toast({
				title: "Error",
				description: "Failed to process message. Please try again.",
				variant: "destructive",
			});
			// Remove the last user message on error
			setMessages(messages);
		} finally {
			if (activePreference?.type !== "webllm") {
				// For API-based models, we can reset sending state here
				// For WebLLM, this will be handled by the WebLLMProvider callback
				setIsSending(false);
			}

			// Focus back on input
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	};

	// Handle WebLLM response (only called when using WebLLM)
	const handleWebLLMResponse = async (response) => {
		const assistantMessage = {
			role: "assistant",
			content: response,
		};

		const newMessages = [...messages, assistantMessage];
		setMessages(newMessages);
		setIsSending(false);

		// Save the complete conversation to DB
		try {
			await updateMessages(chatId, newMessages);
		} catch (error) {
			console.error("Error saving WebLLM chat:", error);
		}
	};

	const handleRenameChat = async () => {
		if (!editTitle.trim() || !chatId || editTitle === chat.title) {
			setIsEditingTitle(false);
			setEditTitle(chat.title || "");
			return;
		}

		try {
			await renameChat(chatId, editTitle);
			setChat({ ...chat, title: editTitle });
			setIsEditingTitle(false);

			// Update chat in history
			setChatHistory((prev) =>
				prev.map((c) => (c.id === chatId ? { ...c, title: editTitle } : c))
			);

			toast({
				title: "Success",
				description: "Chat renamed successfully",
			});
		} catch (error) {
			console.error("Error renaming chat:", error);
			toast({
				title: "Error",
				description: "Failed to rename chat",
				variant: "destructive",
			});
		}
	};

	const handleCreateNewChat = async () => {
		if (!botId) return;

		try {
			setIsCreatingChat(true);

			// Create a new chat with current date/time as title
			const title = new Date().toLocaleString();
			const newChat = await createChat(botId, title);

			// Reload chat history
			await loadChatHistory(botId);

			// Navigate to new chat
			router.push(`/chat/${newChat.id}`);
		} catch (error) {
			console.error("Error creating chat:", error);
			toast({
				title: "Error",
				description: "Failed to create new chat",
				variant: "destructive",
			});
		} finally {
			setIsCreatingChat(false);
		}
	};

	const handleDeleteChat = async (id) => {
		try {
			await deleteChat(id);

			// Update chat history
			setChatHistory((prev) => prev.filter((c) => c.id !== id));

			// If deleted the current chat, go to another chat or dashboard
			if (id === chatId) {
				if (chatHistory.length > 1) {
					// Find the next chat to navigate to
					const nextChat = chatHistory.find((c) => c.id !== id);
					if (nextChat) {
						router.push(`/chat/${nextChat.id}`);
						return;
					}
				}
				router.push("/dashboard");
			}

			toast({
				title: "Success",
				description: "Chat deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting chat:", error);
			toast({
				title: "Error",
				description: "Failed to delete chat",
				variant: "destructive",
			});
		}
	};

	// Reset chat settings to bot defaults
	const resetSettings = () => {
		if (botSettings) {
			setChatSettings({
				temperature: botSettings.temperature || 0.7,
				topP: botSettings.topP || 0.9,
				contextMessagesCount: botSettings.contextMessagesCount || 3,
			});

			toast({
				title: "Settings Reset",
				description: "Chat settings have been reset to bot defaults",
			});
		}
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="flex h-screen">
				{/* Sidebar Skeleton */}
				<div className="w-80 bg-muted flex-shrink-0 border-r h-screen">
					<div className="p-4 flex flex-col h-full">
						<div className="flex items-center justify-between mb-4">
							<div className="h-6 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
							<div className="h-8 w-8 bg-muted-foreground/20 rounded animate-pulse"></div>
						</div>

						<div className="h-10 w-full bg-muted-foreground/20 rounded mb-4 animate-pulse"></div>

						<div className="flex-1 space-y-2 mt-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<div
									key={i}
									className="h-12 bg-muted-foreground/20 rounded animate-pulse"
								></div>
							))}
						</div>
					</div>
				</div>

				{/* Main Content Skeleton */}
				<div className="flex-1 flex flex-col">
					<div className="border-b p-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 bg-muted-foreground/20 rounded-full animate-pulse"></div>
							<div className="h-6 w-32 bg-muted-foreground/20 rounded animate-pulse"></div>
						</div>
						<div className="h-8 w-8 bg-muted-foreground/20 rounded animate-pulse"></div>
					</div>

					<div className="flex-1 flex items-center justify-center">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
							<h2 className="mt-4 text-xl font-semibold">Loading chat...</h2>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!chat || !botId) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center p-6">
					<h2 className="text-2xl font-bold mb-2">Chat Not Found</h2>
					<p className="text-muted-foreground mb-4">
						This chat may have been deleted or is not accessible.
					</p>
					<Button onClick={() => router.push("/dashboard")}>
						Return to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen">
			{/* Chat History Sidebar - non-collapsible */}
			<div className="w-64 bg-muted flex-shrink-0 border-r h-screen">
				<div className="p-4 flex flex-col h-full">
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-semibold">{botName} - Chats</h2>
						<ThemeToggle />
					</div>

					<Button
						onClick={handleCreateNewChat}
						className="mb-4 gap-1"
						disabled={isCreatingChat}
					>
						<Plus className="h-4 w-4" />
						{isCreatingChat ? "Creating..." : "New Chat"}
					</Button>

					<ScrollArea className="flex-1 pr-3">
						{chatHistory.length === 0 ? (
							<div className="text-center p-4 text-muted-foreground">
								No chat history yet
							</div>
						) : (
							<div className="space-y-2">
								{chatHistory.map((historyChat) => {
									const isActive = historyChat.id === chatId;
									const lastMessage =
										historyChat.messages?.length > 0
											? historyChat.messages[historyChat.messages.length - 1]
													?.content
											: "No messages";
									const lastMessagePreview =
										lastMessage?.length > 30
											? `${lastMessage.substring(0, 30)}...`
											: lastMessage;
									const updatedAtDate = historyChat.updatedAt
										? new Date(historyChat.updatedAt)
										: new Date();
									const timeAgo = formatDistanceToNow(updatedAtDate, {
										addSuffix: true,
									});

									return (
										<div
											key={historyChat.id}
											className={cn(
												"group flex flex-col p-3 rounded-md hover:bg-accent transition-colors",
												isActive && "bg-accent"
											)}
										>
											<div className="flex items-center justify-between mb-1">
												<Button
													variant="ghost"
													className="p-0 h-auto font-medium text-left mr-1 hover:bg-transparent"
													onClick={() => router.push(`/chat/${historyChat.id}`)}
												>
													<span className="truncate max-w-[180px] text-sm">
														{historyChat.title || "Untitled Chat"}
													</span>
												</Button>

												<div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() => handleDeleteChat(historyChat.id)}
													>
														<Trash2 className="h-3.5 w-3.5" />
													</Button>
												</div>
											</div>

											<div
												className="text-xs text-muted-foreground truncate cursor-pointer"
												onClick={() => router.push(`/chat/${historyChat.id}`)}
											>
												{lastMessagePreview || "New conversation"}
											</div>

											<div className="text-xs text-muted-foreground mt-1">
												{timeAgo}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</ScrollArea>

					<div className="mt-4 pt-4 border-t">
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={() => router.push("/dashboard")}
						>
							<Bot className="mr-2 h-4 w-4" />
							Back to Bots
						</Button>
					</div>
				</div>
			</div>

			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col h-full">
				{/* Chat Header */}
				<header className="border-b px-4 py-3 flex items-center justify-between bg-card">
					<div className="flex items-center gap-2">
						<Avatar className="h-8 w-8 bg-primary/10 flex items-center justify-center">
							<Bot className="h-5 w-5 text-primary" />
						</Avatar>

						<div>
							{isEditingTitle ? (
								<div className="flex items-center gap-1">
									<Input
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										className="h-7 py-1 text-sm"
										autoFocus
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleRenameChat();
											} else if (e.key === "Escape") {
												setIsEditingTitle(false);
												setEditTitle(chat.title || "");
											}
										}}
									/>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={handleRenameChat}
									>
										<Check className="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={() => {
											setIsEditingTitle(false);
											setEditTitle(chat.title || "");
										}}
									>
										<X className="h-3.5 w-3.5" />
									</Button>
								</div>
							) : (
								<div className="flex items-center">
									<h1
										className="font-medium cursor-pointer hover:underline"
										onClick={() => setIsEditingTitle(true)}
									>
										{chat.title || "Untitled Chat"}
									</h1>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 ml-1"
										onClick={() => setIsEditingTitle(true)}
									>
										<Edit2 className="h-3.5 w-3.5" />
									</Button>
								</div>
							)}
							<p className="text-xs text-muted-foreground truncate max-w-[200px]">
								Bot: {botName}
								{commitInfo && (
									<span className="ml-2 flex items-center">
										<GitCommit className="h-3 w-3 mr-1" />
										<span className="font-mono">
											{commitInfo._id.substring(0, 8)}
										</span>
									</span>
								)}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Dialog
							open={showSettingsDialog}
							onOpenChange={setShowSettingsDialog}
						>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="gap-1">
									<Settings className="h-4 w-4" /> Settings
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Chat Settings</DialogTitle>
								</DialogHeader>

								<div className="py-4 space-y-6">
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="temperature">
												Temperature: {chatSettings.temperature}
											</Label>
											<span className="text-sm text-muted-foreground">
												{chatSettings.temperature === 0
													? "More deterministic"
													: chatSettings.temperature >= 1
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
											value={chatSettings.temperature}
											onChange={(e) =>
												setChatSettings((prev) => ({
													...prev,
													temperature: parseFloat(e.target.value),
												}))
											}
											className="w-full"
										/>
									</div>

									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="topP">Top P: {chatSettings.topP}</Label>
											<span className="text-sm text-muted-foreground">
												{chatSettings.topP <= 0.5
													? "More focused"
													: chatSettings.topP >= 0.9
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
											value={chatSettings.topP}
											onChange={(e) =>
												setChatSettings((prev) => ({
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
												Context Messages: {chatSettings.contextMessagesCount}
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
											value={chatSettings.contextMessagesCount}
											onChange={(e) =>
												setChatSettings((prev) => ({
													...prev,
													contextMessagesCount: parseInt(e.target.value),
												}))
											}
											className="w-full"
										/>
									</div>

									<Button
										onClick={resetSettings}
										variant="outline"
										className="w-full gap-1"
									>
										<RefreshCw className="h-4 w-4" /> Reset to Bot Defaults
									</Button>

									<div className="text-xs text-muted-foreground">
										<p className="mb-1">
											Current model:{" "}
											{activePreference?.type === "webllm"
												? `WebLLM (${activePreference.model_id})`
												: `${activePreference?.provider || "Unknown"} API`}
										</p>
										<p>
											Note: These settings only apply to the current chat
											session and won't be saved permanently.
										</p>
									</div>
								</div>
							</DialogContent>
						</Dialog>

						<Button
							variant="outline"
							size="sm"
							onClick={handleCreateNewChat}
							disabled={isCreatingChat}
							className="gap-1"
						>
							<MessageSquarePlus className="h-4 w-4" />
							{isCreatingChat ? "Creating..." : "New Chat"}
						</Button>
					</div>
				</header>

				{/* Chat Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center p-4">
							<Bot className="h-12 w-12 text-muted-foreground mb-4" />
							<h2 className="text-xl font-medium mb-2">Start a conversation</h2>
							<p className="text-muted-foreground max-w-md">
								Send a message to begin chatting with {botName}.
							</p>
						</div>
					) : (
						messages.map((message, index) => (
							<div
								key={index}
								className={`flex ${
									message.role === "user" ? "justify-end" : "justify-start"
								}`}
							>
								<div
									className={`flex gap-3 max-w-[80%] ${
										message.role === "user" ? "flex-row-reverse" : "flex-row"
									}`}
								>
									<Avatar
										className={`h-8 w-8 hidden sm:flex ${
											message.role === "user"
												? "bg-primary/20"
												: "bg-primary/10"
										} items-center justify-center`}
									>
										{message.role === "user" ? (
											<User className="h-5 w-5 text-primary" />
										) : (
											<Bot className="h-5 w-5 text-primary" />
										)}
									</Avatar>

									<div
										className={`py-2 px-3 rounded-lg ${
											message.role === "user"
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										} max-w-[90%]`}
									>
										{message.role === "user" ? (
											<div className="py-2 px-3 rounded-lg bg-primary text-primary-foreground max-w-[90%]">
												<p className="whitespace-pre-wrap">{message.content}</p>
											</div>
										) : (
											<div className="py-2 px-3 rounded-lg bg-muted max-w-[90%]">
												<div className="prose prose-sm dark:prose-invert prose-pre:bg-muted/50 max-w-none overflow-hidden whitespace-normal">
													<ReactMarkdown>{message.content}</ReactMarkdown>
												</div>
											</div>
										)}

										{/* Add profile link for user messages if we have user info */}
										{message.role === "user" && message.userInfo && (
											<Link
												href={`/profile/${message.userInfo._id}`}
												className="text-xs text-muted-foreground hover:text-primary transition-colors ml-2 mt-1"
											>
												{message.userInfo.name}
											</Link>
										)}
									</div>
								</div>
							</div>
						))
					)}
					<div ref={messagesEndRef} />

					{/* Show loading indicator when sending messages */}
					{isSending && (
						<div className="flex justify-start">
							<div className="flex gap-3 max-w-[80%]">
								<Avatar className="h-8 w-8 hidden sm:flex bg-primary/10 items-center justify-center">
									<Bot className="h-5 w-5 text-primary" />
								</Avatar>
								<div className="py-2 px-4 rounded-lg bg-muted flex items-center">
									<Loader2 className="h-5 w-5 animate-spin" />
									<span className="ml-2 text-sm">Thinking...</span>
								</div>
							</div>
						</div>
					)}
				</div>

				<Separator />

				{/* Input area - updated to disable during model loading */}
				<form onSubmit={handleSendMessage} className="p-4">
					<div className="flex gap-2">
						<Input
							placeholder={
								isModelLoading
									? `Please wait - ${modelLoadingStatus || "Loading model..."}`
									: "Type your message..."
							}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							className="flex-1"
							disabled={isSending || isModelLoading}
							ref={inputRef}
						/>
						<Button
							type="submit"
							size="icon"
							disabled={!input.trim() || isSending || isModelLoading}
						>
							<Send className="h-5 w-5" />
						</Button>
					</div>

					{/* Show model loading indicator */}
					{isModelLoading && (
						<div className="mt-2 text-center">
							<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>{modelLoadingStatus || "Loading model..."}</span>
							</div>
						</div>
					)}
				</form>

				{/* WebLLM Provider - now with loading status callback */}
				{activePreference?.type === "webllm" && (
					<WebLLMProvider
						systemPrompt={
							botSettings?.systemPrompt || "You are a helpful assistant."
						}
						messages={messages}
						userMessage={
							isSending &&
							messages.length > 0 &&
							messages[messages.length - 1]?.role === "user"
								? messages[messages.length - 1].content
								: null
						}
						onResponse={handleWebLLMResponse}
						isSending={isSending}
						modelConfig={activePreference}
						settings={chatSettings}
						onLoadingStatusChange={handleModelLoadingChange}
					/>
				)}
			</div>
		</div>
	);
}
