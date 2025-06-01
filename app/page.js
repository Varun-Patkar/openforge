import { Button } from "@/components/ui/button";
import {
	ArrowRight,
	Cpu,
	Server,
	Globe,
	GitBranch,
	Share2,
	Edit3,
	Users,
} from "lucide-react"; // Added new icons
import Link from "next/link";

export default function Home() {
	return (
		<div className="flex flex-col min-h-[calc(100vh-10rem)]">
			{/* Hero Section */}
			<section className="py-20 md:py-28 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background dark:from-primary/5 -z-10"></div>
				<div className="container px-4 mx-auto flex flex-col items-center text-center max-w-[95%]">
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight pb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-1">
						Open Source the Future of AI Prompts
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mb-10">
						Join a community dedicated to sharing, refining, and advancing
						prompt engineering. Create powerful AI bots by focusing on what
						matters: the prompt.
					</p>
					<div className="flex flex-col sm:flex-row gap-4">
						<Button asChild size="lg" className="group">
							<Link href="/auth">
								Start Crafting Prompts
								<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="/dashboard">Explore Prompts</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 bg-muted/50">
				<div className="container px-4 mx-auto max-w-[95%]">
					<h2 className="text-3xl font-bold text-center mb-12">
						The Platform for Prompt Engineers
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						<FeatureCard
							icon={<Share2 className="h-10 w-10 text-primary" />}
							title="Open Source Prompts"
							description="Share your prompts like code. Collaborate, fork, and improve with the community."
						/>
						<FeatureCard
							icon={<Edit3 className="h-10 w-10 text-chart-2" />}
							title="Focus on Prompting"
							description="We handle the LLM complexities. You focus on crafting the perfect prompt and examples."
						/>
						<FeatureCard
							icon={<Cpu className="h-10 w-10 text-chart-4" />}
							title="Flexible LLM Backend"
							description="Use your own API keys (OpenAI, Azure, etc.) or run models in-browser with WebLLM."
						/>
						<FeatureCard
							icon={<Users className="h-10 w-10 text-chart-5" />}
							title="Community Driven"
							description="Discover, learn, and contribute. Grow together as prompt engineering evolves."
						/>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-primary/10 to-chart-1/10">
				<div className="container px-4 mx-auto text-center max-w-[95%]">
					<h2 className="text-3xl font-bold mb-6">
						Ready to Revolutionize Prompting?
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
						Become part of the movement to make prompt engineering open,
						accessible, and collaborative.
					</p>
					<Button asChild size="lg">
						<Link href="/auth">Join the Community</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}

function FeatureCard({ icon, title, description }) {
	return (
		<div className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
			<div className="mb-4">{icon}</div>
			<h3 className="text-xl font-semibold mb-2">{title}</h3>
			<p className="text-muted-foreground">{description}</p>
		</div>
	);
}
