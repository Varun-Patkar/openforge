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
import { useToast } from "@/hooks/use-toast";
import { Loader2, User as UserIcon, Plus, LockIcon } from "lucide-react";
import BotCard from "@/components/bot-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserProfilePage({ params }) {
	const router = useRouter();
	const { status, user } = useAuth();
	const { toast } = useToast();
	const userId = params.id;

	const [profileUser, setProfileUser] = useState(null);
	const [userBots, setUserBots] = useState([]);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);
	const [isLoadingBots, setIsLoadingBots] = useState(true);
	const [isOwnProfile, setIsOwnProfile] = useState(false);

	// Load user profile and bots
	useEffect(() => {
		const loadUserProfile = async () => {
			try {
				setIsLoadingProfile(true);

				// Check if viewing own profile
				if (
					status === "authenticated" &&
					user &&
					(userId === "me" || userId === user.id)
				) {
					setProfileUser(user);
					setIsOwnProfile(true);

					// If it's our own profile with the "me" slug, update URL to show actual ID
					if (userId === "me") {
						// Use replace to avoid adding to history stack
						window.history.replaceState(null, "", `/profile/${user.id}`);
					}
				} else {
					// Fetch other user's profile
					const response = await fetch(`/api/users/${userId}`);

					if (!response.ok) {
						if (response.status === 404) {
							toast({
								title: "User not found",
								description:
									"This user profile doesn't exist or has been removed.",
								variant: "destructive",
							});
							router.push("/dashboard");
							return;
						}
						throw new Error("Failed to fetch user profile");
					}

					const userData = await response.json();
					setProfileUser(userData);
					setIsOwnProfile(
						status === "authenticated" && user && user.id === userId
					);
				}
			} catch (error) {
				console.error("Error loading user profile:", error);
				toast({
					title: "Error",
					description: "Failed to load user profile",
					variant: "destructive",
				});
			} finally {
				setIsLoadingProfile(false);
			}
		};

		if (userId) {
			loadUserProfile();
		}
	}, [userId, status, user, toast, router]);

	// Load user's bots separately
	useEffect(() => {
		const loadUserBots = async () => {
			if (!profileUser) return;

			try {
				setIsLoadingBots(true);
				const response = await fetch(`/api/users/${profileUser.id}/bots`);

				if (!response.ok) {
					throw new Error("Failed to fetch user bots");
				}

				const botsData = await response.json();
				setUserBots(botsData);
			} catch (error) {
				console.error("Error loading user bots:", error);
				toast({
					title: "Error",
					description: "Failed to load user's bots",
					variant: "destructive",
				});
			} finally {
				setIsLoadingBots(false);
			}
		};

		if (profileUser) {
			loadUserBots();
		}
	}, [profileUser, toast]);

	if (isLoadingProfile) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<div className="text-center">
					<Loader2 className="h-12 w-12 animate-spin mx-auto" />
					<h2 className="mt-4 text-xl font-semibold">Loading profile...</h2>
				</div>
			</div>
		);
	}

	if (!profileUser) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>User Not Found</CardTitle>
						<CardDescription>
							The user profile you're looking for doesn't exist or has been
							removed.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button onClick={() => router.push("/dashboard")}>
							Return to Dashboard
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container px-4 py-12 mx-auto max-w-[90%]">
			{/* Profile Header with Avatar */}
			<div className="flex flex-col items-center mb-8">
				<Avatar className="h-24 w-24 mb-4">
					<AvatarImage
						src={profileUser?.image}
						alt={profileUser?.name || "User"}
					/>
					<AvatarFallback className="text-2xl">
						{profileUser?.name ? (
							profileUser.name.charAt(0).toUpperCase()
						) : (
							<UserIcon />
						)}
					</AvatarFallback>
				</Avatar>
				<h1 className="text-3xl font-bold">
					{profileUser?.name || "User Profile"}
				</h1>
				{isOwnProfile && (
					<p className="text-muted-foreground">{profileUser?.email}</p>
				)}
			</div>

			<Tabs defaultValue="bots" className="w-full mb-8">
				<TabsList className="mb-6">
					<TabsTrigger value="bots">Bots</TabsTrigger>
					{isOwnProfile && (
						<TabsTrigger value="settings">Account Settings</TabsTrigger>
					)}
				</TabsList>

				{/* Bots Tab */}
				<TabsContent value="bots">
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-2xl font-semibold">
							{isOwnProfile ? "Your Bots" : `${profileUser.name}'s Bots`}
						</h2>
						{isOwnProfile && (
							<Button
								onClick={() => router.push("/bots/new")}
								className="gap-1"
							>
								<Plus className="h-4 w-4" /> Create New Bot
							</Button>
						)}
					</div>

					{isLoadingBots ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<Card key={i} className="animate-pulse">
									<CardHeader>
										<div className="h-7 bg-muted rounded w-3/4 mb-2"></div>
										<div className="h-5 bg-muted rounded w-1/2"></div>
									</CardHeader>
									<CardContent>
										<div className="h-28 bg-muted rounded"></div>
									</CardContent>
								</Card>
							))}
						</div>
					) : userBots.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{userBots.map((bot) => (
								<BotCard
									key={bot.id}
									bot={bot}
									isOwner={isOwnProfile}
									showAccess={!bot.isPublic}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-16 px-4 bg-muted/30 rounded-lg">
							<h3 className="text-xl font-medium mb-2">
								{isOwnProfile
									? "You haven't created any bots yet"
									: `${profileUser.name} hasn't created any public bots yet`}
							</h3>
							{isOwnProfile && (
								<>
									<p className="text-muted-foreground mb-6">
										Create your first bot to get started
									</p>
									<Button onClick={() => router.push("/bots/new")}>
										Create Your First Bot
									</Button>
								</>
							)}
						</div>
					)}
				</TabsContent>

				{/* Account Settings Tab - Only for own profile */}
				{isOwnProfile && (
					<TabsContent value="settings">
						<Card className="mb-8">
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>Manage your account details</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div>
										<p className="text-sm font-medium">Name</p>
										<p className="text-muted-foreground">
											{profileUser?.name || "Not provided"}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium">Email</p>
										<p className="text-muted-foreground">
											{profileUser?.email || "Not provided"}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-destructive">
							<CardHeader>
								<CardTitle className="text-destructive">Danger Zone</CardTitle>
								<CardDescription>Actions here cannot be undone</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm mb-4">
									Deleting your account will permanently remove all your data,
									including:
								</p>
								<ul className="list-disc pl-5 space-y-1 text-sm">
									<li>All bots you've created</li>
									<li>All chat conversations</li>
									<li>Your preferences and settings</li>
								</ul>
							</CardContent>
							<CardContent>
								<Button
									variant="destructive"
									onClick={() => router.push("/profile/delete-account")}
								>
									Delete Account
								</Button>
							</CardContent>
						</Card>
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
