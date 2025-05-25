"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import BotCard from "@/components/bot-card";
import { useAuth } from "@/context/auth-context";
import { fetchUserBots, fetchPublicBots } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
	const router = useRouter();
	const { status } = useAuth();
	const { toast } = useToast();
	const [searchQuery, setSearchQuery] = useState("");
	const [userBots, setUserBots] = useState([]);
	const [publicBots, setPublicBots] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
		}
	}, [status, router]);

	useEffect(() => {
		const loadBots = async () => {
			if (status !== "authenticated") {
				return; // Don't fetch if not authenticated
			}

			setIsLoading(true);
			try {
				// Fetch bots in parallel
				const [myBots, gallery] = await Promise.all([
					fetchUserBots(),
					fetchPublicBots(),
				]);

				setUserBots(myBots);
				setPublicBots(gallery);
			} catch (error) {
				console.error("Error loading bots:", error);
				toast({
					title: "Error",
					description: "Failed to load bots. Please try again.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		if (status === "authenticated") {
			loadBots();
		}
	}, [status, toast]);

	const filteredUserBots = userBots.filter(
		(bot) =>
			bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			bot.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredPublicBots = publicBots.filter(
		(bot) =>
			bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			bot.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (status === "loading" || isLoading) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<h2 className="mt-4 text-xl font-semibold">Loading dashboard...</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="container px-4 py-8 mx-auto">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground">
						Manage your LLM bots and explore the community
					</p>
				</div>
				<Button onClick={() => router.push("/bots/new")} className="gap-1">
					<Plus className="h-4 w-4" /> Create New Bot
				</Button>
			</div>

			<div className="mb-6 relative max-w-md">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search bots..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9"
				/>
			</div>

			<Tabs defaultValue="my-bots" className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="my-bots">Your Bots</TabsTrigger>
					<TabsTrigger value="gallery">Gallery</TabsTrigger>
				</TabsList>

				<TabsContent value="my-bots">
					{filteredUserBots.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredUserBots.map((bot) => (
								<BotCard key={bot.id} bot={bot} isOwner={true} />
							))}
						</div>
					) : (
						<div className="text-center py-16 px-4">
							<h3 className="text-xl font-medium mb-2">
								You haven't created any bots yet
							</h3>
							<p className="text-muted-foreground mb-6">
								Create your first bot to get started
							</p>
							<Button onClick={() => router.push("/bots/new")}>
								Create Your First Bot
							</Button>
						</div>
					)}
				</TabsContent>

				<TabsContent value="gallery">
					{filteredPublicBots.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredPublicBots.map((bot) => (
								<BotCard key={bot.id} bot={bot} isOwner={false} />
							))}
						</div>
					) : (
						<div className="text-center py-16 px-4">
							<h3 className="text-xl font-medium mb-2">
								No public bots available
							</h3>
							<p className="text-muted-foreground">
								Be the first to share a bot with the community!
							</p>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
