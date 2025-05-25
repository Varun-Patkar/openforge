"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
	MessageSquarePlus,
	Edit2,
	Trash2,
	X,
	Check,
	Bot,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
	fetchUserChats,
	createChat,
	deleteChat,
	renameChat,
} from "@/lib/chat-api";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ChatLayout({ children }) {
	const router = useRouter();
	const pathname = usePathname();
	const { status, user } = useAuth();
	const { toast } = useToast();

	const [chats, setChats] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editingChatId, setEditingChatId] = useState(null);
	const [editTitle, setEditTitle] = useState("");
	const [sidebarOpen, setSidebarOpen] = useState(true);

	useEffect(() => {
		// Load chats when authenticated
		if (status === "authenticated") {
			loadChats();
		} else if (status === "unauthenticated") {
			router.push("/auth");
		}
	}, [status, router]);

	const loadChats = async () => {
		try {
			setIsLoading(true);
			const userChats = await fetchUserChats();
			setChats(userChats);
		} catch (error) {
			console.error("Error loading chats:", error);
			toast({
				title: "Error",
				description: "Failed to load chat history",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateChat = async (botId) => {
		try {
			// Default title using current date/time
			const defaultTitle = format(new Date(), "MMM d, yyyy h:mm a");
			const newChat = await createChat({ botId, title: defaultTitle });
			setChats((prev) => [newChat, ...prev]);
			router.push(`/chat/${newChat.id}`);
		} catch (error) {
			console.error("Error creating chat:", error);
			toast({
				title: "Error",
				description: "Failed to create new chat",
				variant: "destructive",
			});
		}
	};

	const handleRenameChat = async (chatId, newTitle) => {
		if (!newTitle.trim()) return;

		try {
			await renameChat(chatId, newTitle);
			setChats((prev) =>
				prev.map((chat) =>
					chat.id === chatId ? { ...chat, title: newTitle } : chat
				)
			);
			setEditingChatId(null);
		} catch (error) {
			console.error("Error renaming chat:", error);
			toast({
				title: "Error",
				description: "Failed to rename chat",
				variant: "destructive",
			});
		}
	};

	const handleDeleteChat = async (chatId) => {
		try {
			await deleteChat(chatId);
			setChats((prev) => prev.filter((chat) => chat.id !== chatId));

			// If current chat is deleted, go to chat index
			if (pathname.includes(`/chat/${chatId}`)) {
				router.push("/chat");
			}
		} catch (error) {
			console.error("Error deleting chat:", error);
			toast({
				title: "Error",
				description: "Failed to delete chat",
				variant: "destructive",
			});
		}
	};

	const startEditingChat = (chat) => {
		setEditingChatId(chat.id);
		setEditTitle(chat.title);
	};

	// Show only loading or auth check if status is not resolved
	if (status === "loading") {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="flex h-screen">
			{/* Main Content */}
			<div className="flex-1 overflow-hidden">{children}</div>
		</div>
	);
}
