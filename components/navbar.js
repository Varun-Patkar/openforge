"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
	LayoutDashboard,
	PlusCircle,
	LogOut,
	Github,
	Menu,
	Cpu,
	User as UserIcon, // Renamed to avoid conflict
	Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import { useRouter } from "next/navigation";

export function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const { status, user, signOut } = useAuth(); // Destructure user
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	const isAuthenticated = status === "authenticated";

	const closeMobileNav = () => setMobileNavOpen(false);

	const navItemsBase = [
		{
			href: "/dashboard",
			label: "Dashboard",
			icon: <LayoutDashboard className="h-4 w-4" />,
		},
		{
			href: "/bots/new",
			label: "Create Bot",
			icon: <PlusCircle className="h-4 w-4" />,
		},
	];

	const navItems = isAuthenticated
		? navItemsBase
		: [{ href: "/auth", label: "Login", icon: <Github className="h-4 w-4" /> }];

	const UserAvatar = () => (
		<Avatar className="h-8 w-8 cursor-pointer">
			<AvatarImage
				src={user?.image || undefined}
				alt={user?.name || user?.email || "User"}
			/>
			<AvatarFallback>
				{user?.name ? (
					user.name.charAt(0).toUpperCase()
				) : (
					<UserIcon className="h-4 w-4" />
				)}
			</AvatarFallback>
		</Avatar>
	);

	return (
		<header className="border-b bg-card">
			<div className="container mx-auto px-4 flex items-center justify-between h-16 max-w-[95%]">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2 font-bold text-xl">
					<Cpu className="h-6 w-6 text-primary" />
					<span className="hidden sm:inline">OpenForge</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-4">
					{" "}
					{/* Adjusted gap */}
					<ul className="flex gap-1">
						{navItems.map((item) => (
							<li key={item.href}>
								<Button
									asChild
									variant={pathname === item.href ? "secondary" : "ghost"}
									size="sm"
									className="gap-1"
								>
									<Link href={item.href}>
										{item.icon}
										{item.label}
									</Link>
								</Button>
							</li>
						))}
					</ul>
					<ThemeToggle />
					{isAuthenticated && user && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full p-0"
								>
									<UserAvatar />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											{user.name || "User"}
										</p>
										{user.email && (
											<p className="text-xs leading-none text-muted-foreground">
												{user.email}
											</p>
										)}
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => router.push(`/profile/${user.id}`)}
									className="cursor-pointer"
								>
									<UserIcon className="mr-2 h-4 w-4" />
									<span>Profile</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => router.push("/preferences")}
									className="cursor-pointer"
								>
									<Settings className="mr-2 h-4 w-4" />
									<span>Preferences</span>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={signOut} className="cursor-pointer">
									<LogOut className="mr-2 h-4 w-4" />
									<span>Logout</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</nav>

				{/* Mobile Navigation */}
				<div className="flex items-center gap-2 md:hidden">
					<ThemeToggle />
					{isAuthenticated &&
						user && ( // Show avatar for mobile if authenticated
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full p-0"
									>
										<UserAvatar />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">
												{user.name || "User"}
											</p>
											{user.email && (
												<p className="text-xs leading-none text-muted-foreground">
													{user.email}
												</p>
											)}
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => router.push(`/profile/${user.id}`)}
										className="cursor-pointer"
									>
										<UserIcon className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => router.push("/preferences")}
										className="cursor-pointer"
									>
										<Settings className="mr-2 h-4 w-4" />
										<span>Preferences</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={signOut}
										className="cursor-pointer"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Logout</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					<Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" aria-label="Menu">
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-60 sm:w-80">
							<SheetHeader className="mb-6">
								<SheetTitle className="flex items-center gap-2">
									<Cpu className="h-5 w-5 text-primary" />
									OpenForge
								</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col gap-2">
								{" "}
								{/* Reduced gap */}
								{navItems.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={closeMobileNav}
										className={cn(
											"flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-muted transition-colors text-sm", // Adjusted padding and gap
											pathname === item.href && "bg-secondary font-medium"
										)}
									>
										{item.icon}
										{item.label}
									</Link>
								))}
								{isAuthenticated && (
									<button
										onClick={() => {
											signOut();
											closeMobileNav();
										}}
										className="flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-muted transition-colors text-left text-sm" // Adjusted padding and gap
									>
										<LogOut className="h-4 w-4" />
										Logout
									</button>
								)}
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
