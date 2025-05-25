import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context"; // Ensure this path is correct
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { PreferencesProvider } from "@/context/preferences-context"; // Ensure path is correct
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "OpenForge",
	description: "Forge your custom LLM assistants",
	icons: {
		icon: [
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
		// other specific icons like 'shortcut' can also be added if needed
	},
	manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<AuthProvider>
					{" "}
					<PreferencesProvider>
						{" "}
						{/* Add PreferencesProvider here */}
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<div className="flex flex-col min-h-screen">
								<Navbar />
								<main className="flex-grow">{children}</main>
								<Toaster />
							</div>
						</ThemeProvider>
					</PreferencesProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
