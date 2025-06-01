import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

export default function NotFound() {
	return (
		<div className="container flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 text-center">
			<h1 className="text-9xl font-bold text-primary mb-4">404</h1>
			<h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
			<p className="text-muted-foreground mb-8 max-w-md">
				We couldn&apos;t find the page you&apos;re looking for.
			</p>
			<p className="text-muted-foreground mb-8 max-w-md">
				Don&apos;t worry, we&apos;ll help you get back on track.
			</p>
			<Button asChild className="gap-2">
				<Link href="/">
					<HomeIcon className="h-4 w-4" />
					Return Home
				</Link>
			</Button>
		</div>
	);
}
