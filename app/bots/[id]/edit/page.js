"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getBotById, updateBot } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function EditBotPage({ params }) {
	const router = useRouter();
	const { status } = useAuth();
	const { toast } = useToast();
	const botId = params.id;

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		visibility: "private",
		systemPrompt: "",
		examples: [{ input: "", expectedOutput: "" }],
		// LLM parameters with defaults
		temperature: 0.7,
		topP: 0.9,
		contextMessagesCount: 3,
	});

	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
			return;
		}

		const loadBot = async () => {
			try {
				setIsLoading(true);
				const botData = await getBotById(botId);
				if (!botData) {
					toast({
						title: "Error",
						description: "Bot not found",
						variant: "destructive",
					});
					router.push("/dashboard");
					return;
				}

				setFormData({
					name: botData.name || "",
					description: botData.description || "",
					visibility: botData.visibility || "private",
					systemPrompt: botData.systemPrompt || "",
					examples:
						botData.examples?.length > 0
							? botData.examples
							: [{ input: "", expectedOutput: "" }],
					// Load LLM parameters with defaults if not present
					temperature:
						botData.temperature !== undefined ? botData.temperature : 0.7,
					topP: botData.topP !== undefined ? botData.topP : 0.9,
					contextMessagesCount:
						botData.contextMessagesCount !== undefined
							? botData.contextMessagesCount
							: 3,
				});
			} catch (error) {
				console.error("Error loading bot:", error);
				toast({
					title: "Error",
					description: "Failed to load bot data. Please try again.",
					variant: "destructive",
				});
				router.push("/dashboard");
			} finally {
				setIsLoading(false);
			}
		};

		if (botId) {
			loadBot();
		}
	}, [botId, status, router, toast]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleVisibilityChange = (value) => {
		setFormData((prev) => ({ ...prev, visibility: value }));
	};

	const handleExampleChange = (index, field, value) => {
		const updatedExamples = [...formData.examples];
		updatedExamples[index] = { ...updatedExamples[index], [field]: value };
		setFormData((prev) => ({ ...prev, examples: updatedExamples }));
	};

	const addExample = () => {
		setFormData((prev) => ({
			...prev,
			examples: [...prev.examples, { input: "", expectedOutput: "" }],
		}));
	};

	const removeExample = (index) => {
		if (formData.examples.length > 1) {
			const updatedExamples = formData.examples.filter((_, i) => i !== index);
			setFormData((prev) => ({ ...prev, examples: updatedExamples }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			toast({
				title: "Error",
				description: "Bot name is required",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await updateBot(botId, formData);
			toast({
				title: "Success",
				description: "Bot updated successfully",
			});
			router.push(`/bots/${botId}`);
		} catch (error) {
			console.error("Error updating bot:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to update bot. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<h2 className="mt-4 text-xl font-semibold">Loading bot data...</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="container px-4 py-8 mx-auto max-w-3xl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold mb-2">Edit Bot</h1>
				<p className="text-muted-foreground">Update your bot's configuration</p>
			</div>

			<form onSubmit={handleSubmit}>
				{/* Basic information card - existing code */}
				<Card className="mb-8">
					<CardContent className="pt-6 space-y-6">
						<div className="grid gap-3">
							<Label htmlFor="name">Bot Name</Label>
							<Input
								id="name"
								name="name"
								placeholder="My Awesome Assistant"
								value={formData.name}
								onChange={handleChange}
								maxLength={50}
							/>
						</div>

						<div className="grid gap-3">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="A brief description of what this bot does"
								value={formData.description}
								onChange={handleChange}
								maxLength={200}
								className="resize-none h-20"
							/>
						</div>

						<div className="grid gap-3">
							<Label>Visibility</Label>
							<RadioGroup
								value={formData.visibility}
								onValueChange={handleVisibilityChange}
								className="flex space-x-4"
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="public" id="public" />
									<Label htmlFor="public" className="cursor-pointer">
										Public
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="private" id="private" />
									<Label htmlFor="private" className="cursor-pointer">
										Private
									</Label>
								</div>
							</RadioGroup>
							<p className="text-sm text-muted-foreground">
								{formData.visibility === "public"
									? "Anyone can view and use this bot"
									: "Only you can access this bot"}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="mb-8">
					<CardContent className="pt-6 space-y-6">
						<div className="grid gap-3">
							<Label htmlFor="systemPrompt">Base System Prompt</Label>
							<Textarea
								id="systemPrompt"
								name="systemPrompt"
								placeholder="You are a helpful assistant that..."
								value={formData.systemPrompt}
								onChange={handleChange}
								className="resize-none h-32"
							/>
							<p className="text-sm text-muted-foreground">
								This defines your bot's personality and behavior
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="mb-8">
					<CardContent className="pt-6 space-y-6">
						<h3 className="text-lg font-medium">LLM Parameters</h3>
						<p className="text-sm text-muted-foreground">
							Configure how the language model generates responses
						</p>

						<div className="grid gap-6">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="temperature">
										Temperature: {formData.temperature}
									</Label>
									<span className="text-sm text-muted-foreground">
										{formData.temperature === 0
											? "More deterministic"
											: formData.temperature >= 1
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
									value={formData.temperature}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											temperature: parseFloat(e.target.value),
										}))
									}
									className="w-full"
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="topP">Top P: {formData.topP}</Label>
									<span className="text-sm text-muted-foreground">
										{formData.topP <= 0.5
											? "More focused"
											: formData.topP >= 0.9
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
									value={formData.topP}
									onChange={(e) =>
										setFormData((prev) => ({
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
										Context Messages: {formData.contextMessagesCount}
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
									value={formData.contextMessagesCount}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											contextMessagesCount: parseInt(e.target.value),
										}))
									}
									className="w-full"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="mb-8">
					<CardContent className="pt-6 space-y-6">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Test-case Examples</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addExample}
								className="gap-1"
							>
								<Plus className="h-4 w-4" /> Add Example
							</Button>
						</div>

						<div className="space-y-6">
							{formData.examples.map((example, index) => (
								<div
									key={index}
									className="p-4 border rounded-md bg-muted/30 relative"
								>
									<div className="grid gap-3 mb-4">
										<Label htmlFor={`input-${index}`}>User Input</Label>
										<Textarea
											id={`input-${index}`}
											value={example.input}
											onChange={(e) =>
												handleExampleChange(index, "input", e.target.value)
											}
											placeholder="What user might ask..."
											className="resize-none h-20"
										/>
									</div>

									<div className="grid gap-3">
										<Label htmlFor={`output-${index}`}>Expected Output</Label>
										<Textarea
											id={`output-${index}`}
											value={example.expectedOutput}
											onChange={(e) =>
												handleExampleChange(
													index,
													"expectedOutput",
													e.target.value
												)
											}
											placeholder="How your bot should respond..."
											className="resize-none h-20"
										/>
									</div>

									{formData.examples.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => removeExample(index)}
											className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<div className="flex gap-4 justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push(`/bots/${botId}`)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : "Update Bot"}
					</Button>
				</div>
			</form>
		</div>
	);
}
