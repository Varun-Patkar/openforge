"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
	const router = useRouter();
	const { status, user, signOut } = useAuth();
	const { toast } = useToast();

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteAccount = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch("/api/account", {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete account");
			}

			toast({
				title: "Account Deleted",
				description: "Your account and all associated data have been deleted.",
			});

			// Sign out after successful deletion
			await signOut({ callbackUrl: "/" });
		} catch (error) {
			console.error("Error deleting account:", error);
			toast({
				title: "Error",
				description: "Failed to delete account. Please try again.",
				variant: "destructive",
			});
			setIsDeleting(false);
		}
	};

	if (status === "loading") {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<div className="text-center">
					<Loader2 className="h-12 w-12 animate-spin mx-auto" />
					<h2 className="mt-4 text-xl font-semibold">Loading profile...</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="container px-4 py-12 mx-auto max-w-3xl">
			<h1 className="text-3xl font-bold mb-6">Account Settings</h1>

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
								{user?.name || "Not provided"}
							</p>
						</div>
						<div>
							<p className="text-sm font-medium">Email</p>
							<p className="text-muted-foreground">
								{user?.email || "Not provided"}
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
				<CardFooter>
					<Button
						variant="destructive"
						onClick={() => setShowDeleteDialog(true)}
					>
						Delete Account
					</Button>
				</CardFooter>
			</Card>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							Delete Account Permanently?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete your account and all associated data.
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteAccount}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete My Account"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
