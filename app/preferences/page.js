// filepath: d:\Projects\openforge\app\preferences\page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { usePreferences } from "@/context/preferences-context";
import { webllmModels, webllmModelCompanies } from "@/lib/webllm-models";
import {
	PlusCircle,
	Trash2,
	Edit3,
	Search,
	CheckCircle,
	Circle,
	X,
} from "lucide-react";
import { ModelIcon } from "@/components/model-icons"; // Import the ModelIcon component
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"; // Import Accordion components

const AVAILABLE_PROVIDERS = [
	"OpenAI",
	"Azure OpenAI",
	"Anthropic",
	"Cohere",
	"Groq",
	"Ollama",
]; // Add more as needed

export default function PreferencesPage() {
	const router = useRouter();
	const { status: authStatus } = useAuth();
	const {
		preferences,
		addApiKey,
		deleteApiKey,
		updateApiKey,
		selectWebLLM,
		setActivePreference,
		getActivePreferenceDetails,
		isPreferencesLoaded, // Destructure isPreferencesLoaded
	} = usePreferences();
	const { toast } = useToast();

	// API Key Management State
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const [currentApiKey, setCurrentApiKey] = useState({
		id: null,
		name: "",
		provider: AVAILABLE_PROVIDERS[0],
		apiKey: "",
	});
	const [isEditingApiKey, setIsEditingApiKey] = useState(false);

	// WebLLM State
	const [webllmSearch, setWebllmSearch] = useState("");
	// const [webllmCompanyFilter, setWebllmCompanyFilter] = useState("All");
	const [webllmCompanyFilter, setWebllmCompanyFilter] = useState("All");
	const [expandedAccordionItems, setExpandedAccordionItems] = useState([]);
	// Replace single filter with array of selected filters
	const [selectedFilters, setSelectedFilters] = useState([]);
	// Add a new state for expanded model families
	const [expandedFamilies, setExpandedFamilies] = useState([]);

	useEffect(() => {
		if (authStatus === "unauthenticated" && isPreferencesLoaded) {
			// Ensure preferences also loaded or it might redirect too early
			router.push("/auth");
		}
	}, [authStatus, router, isPreferencesLoaded]);

	const activePreferenceDetails = getActivePreferenceDetails(); // Called on every render

	const handleApiKeyFormSubmit = (e) => {
		e.preventDefault();
		if (!currentApiKey.provider || !currentApiKey.apiKey.trim()) {
			toast({
				title: "Error",
				description: "Provider and API Key are required.",
				variant: "destructive",
			});
			return;
		}
		if (isEditingApiKey && currentApiKey.id) {
			updateApiKey(currentApiKey.id, {
				name: currentApiKey.name,
				provider: currentApiKey.provider,
				apiKey: currentApiKey.apiKey,
			});
			toast({ title: "Success", description: "API Key updated." });
		} else {
			addApiKey({
				name: currentApiKey.name,
				provider: currentApiKey.provider,
				apiKey: currentApiKey.apiKey,
			});
			toast({ title: "Success", description: "API Key added." });
		}
		setShowApiKeyDialog(false);
		setCurrentApiKey({
			id: null,
			name: "",
			provider: AVAILABLE_PROVIDERS[0],
			apiKey: "",
		});
		setIsEditingApiKey(false);
	};

	const openEditApiKeyDialog = (apiKey) => {
		setCurrentApiKey(apiKey);
		setIsEditingApiKey(true);
		setShowApiKeyDialog(true);
	};

	const openAddApiKeyDialog = () => {
		setCurrentApiKey({
			id: null,
			name: "",
			provider: AVAILABLE_PROVIDERS[0],
			apiKey: "",
		});
		setIsEditingApiKey(false);
		setShowApiKeyDialog(true);
	};

	const toggleFilter = (company) => {
		setSelectedFilters((prev) => {
			if (prev.includes(company)) {
				// Remove filter if already selected
				return prev.filter((item) => item !== company);
			} else {
				// Add filter if not selected
				return [...prev, company];
			}
		});
	};

	const clearFilters = () => {
		setSelectedFilters([]);
	};

	const filteredWebLLMModelGroups = useMemo(() => {
		const searchLower = webllmSearch.toLowerCase().trim();

		const result = webllmModels
			.filter((group) => {
				// If no company filters are selected, show all
				const matchesCompany =
					selectedFilters.length === 0 ||
					selectedFilters.includes(group.company);

				if (!matchesCompany) return false;
				if (searchLower === "") return true; // No search query, company filter is enough

				// Group matches if search term is in baseModelName or any of its versionIdentifiers
				const matchesSearch =
					group.baseModelName.toLowerCase().includes(searchLower) ||
					group.versions.some((v) =>
						v.versionIdentifier.toLowerCase().includes(searchLower)
					);
				return matchesSearch;
			})
			.map((group) => {
				if (searchLower === "") {
					return group; // No search query, return all versions of the matched group
				}

				// If the group's baseModelName matches the search, include all its versions
				if (group.baseModelName.toLowerCase().includes(searchLower)) {
					return group;
				}

				// Otherwise, filter versions within the group by versionIdentifier
				const filteredVersions = group.versions.filter((v) =>
					v.versionIdentifier.toLowerCase().includes(searchLower)
				);

				return { ...group, versions: filteredVersions };
			})
			.filter((group) => group.versions.length > 0); // Only include groups that have matching versions after filtering

		return result;
	}, [webllmSearch, selectedFilters, webllmModels]);

	const handleSelectWebLLM = (versionModel) => {
		selectWebLLM(versionModel); // This updates preferences.selectedWebLLM in the context and calls setActivePreference
		toast({
			title: "WebLLM Selected",
			description: `${versionModel.model_id} is now your active WebLLM preference.`,
		});
	};

	const handleSetActiveApiKey = (apiKeyId) => {
		const apiKey = preferences.apiKeys.find((k) => k.id === apiKeyId);
		const activePrefPayload = { type: "api", id: apiKeyId };
		setActivePreference(activePrefPayload);
		toast({
			title: "API Key Activated",
			description: `${apiKey?.name || apiKey?.provider} is now active.`,
		});
	};

	// Update loading condition to wait for both auth and preferences
	if (authStatus === "loading" || !isPreferencesLoaded) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<h2 className="mt-4 text-xl font-semibold">Loading Preferences...</h2>
				</div>
			</div>
		);
	}
	const handleContinueToDashboard = () => {
		if (!activePreferenceDetails) {
			toast({
				title: "No Preference Selected",
				description:
					"Please select an active LLM preference (API Key or WebLLM model) to continue.",
				variant: "default", // or "warning" if you have one
			});
		} else {
			router.push("/dashboard");
		}
	};

	const toggleFamilyExpanded = (modelFamily) => {
		setExpandedFamilies((prev) => {
			if (prev.includes(modelFamily)) {
				return prev.filter((item) => item !== modelFamily);
			} else {
				return [...prev, modelFamily];
			}
		});
	};

	return (
		<div className="container px-4 py-12 mx-auto max-w-5xl space-y-10">
			<div className="text-center">
				<h1 className="text-3xl font-bold mb-3">LLM Preferences</h1>
				<p className="text-muted-foreground">
					Manage your API keys and WebLLM model configurations.
				</p>
			</div>

			{/* API Key Management Section */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>API Key Providers</CardTitle>
						<CardDescription>
							Add and manage API keys for various LLM providers.
						</CardDescription>
					</div>
					<Button onClick={openAddApiKeyDialog} size="sm" className="gap-1">
						<PlusCircle className="h-4 w-4" /> Add API Key
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					{preferences.apiKeys.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-4">
							No API keys added yet.
						</p>
					)}
					{preferences.apiKeys.map((key) => {
						const isActiveApiKey =
							activePreferenceDetails?.type === "api" &&
							activePreferenceDetails?.id === key.id;
						return (
							<div
								key={key.id}
								className={`flex items-center justify-between p-3 border rounded-md transition-colors 
															${
																isActiveApiKey
																	? "bg-primary/10 ring-2 ring-primary dark:bg-primary/20"
																	: "hover:bg-muted/50"
															}`}
							>
								<div>
									<p className="font-medium">
										{key.name || `${key.provider} Key`}
									</p>
									<p className="text-sm text-muted-foreground">
										{key.provider} - Key: ••••••••{key.apiKey.slice(-4)}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant={isActiveApiKey ? "secondary" : "outline"}
										size="sm"
										onClick={() => handleSetActiveApiKey(key.id)}
										className="gap-1"
									>
										{isActiveApiKey ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<Circle className="h-4 w-4" />
										)}
										{isActiveApiKey ? "Active" : "Set Active"}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditApiKeyDialog(key)}
										className="h-8 w-8"
									>
										<Edit3 className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => deleteApiKey(key.id)}
										className="h-8 w-8 text-destructive hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						);
					})}
				</CardContent>
			</Card>

			{/* WebLLM Configuration Section */}
			<Card>
				<CardHeader>
					<CardTitle>WebLLM (In-Browser Models)</CardTitle>
					<CardDescription>
						Select a model to run directly in your browser. No data leaves your
						device.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-6">
						{/* Search Input */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search models by ID or name..."
								value={webllmSearch}
								onChange={(e) => setWebllmSearch(e.target.value)}
								className="pl-9"
							/>
						</div>

						{/* Model Family Filter Buttons */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label className="text-sm font-medium">
									Filter by model family:
								</Label>
								{selectedFilters.length > 0 && (
									<Button
										variant="ghost"
										size="sm"
										onClick={clearFilters}
										className="h-8 px-2 text-xs"
									>
										<X className="h-3.5 w-3.5 mr-1" /> Clear filters
									</Button>
								)}
							</div>
							<div className="flex flex-wrap gap-2">
								{webllmModelCompanies.map((company) => (
									<Button
										key={company}
										variant={
											selectedFilters.includes(company)
												? "secondary"
												: "outline"
										}
										size="sm"
										onClick={() => toggleFilter(company)}
										className={`flex items-center gap-1.5 h-9 transition-all ${
											selectedFilters.includes(company)
												? "bg-secondary text-secondary-foreground"
												: ""
										}`}
									>
										{/* Replace the image with ModelIcon component */}
										<ModelIcon company={company} className="h-5 w-5" />
										{company}
									</Button>
								))}
							</div>
						</div>
					</div>

					<div className="max-h-[32rem] overflow-y-auto pr-2 pt-1">
						{filteredWebLLMModelGroups.length === 0 && (
							<p className="text-sm text-muted-foreground text-center py-4">
								No models match your criteria.
							</p>
						)}

						{/* Change the grid to make each item control its own height */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-auto">
							{filteredWebLLMModelGroups.map((group) => {
								const isExpanded = expandedFamilies.includes(
									group.baseModelName
								);
								const hasActiveModel = group.versions.some(
									(v) =>
										activePreferenceDetails?.type === "webllm" &&
										activePreferenceDetails?.model_id === v.model_id
								);

								return (
									<div key={group.baseModelName} className="grid-item h-fit">
										<Card
											className={`overflow-hidden transition-shadow ${
												hasActiveModel ? "ring-1 ring-primary" : ""
											}`}
										>
											<CardHeader
												className={`p-4 cursor-pointer ${
													hasActiveModel ? "bg-primary/10" : ""
												}`}
												onClick={() =>
													toggleFamilyExpanded(group.baseModelName)
												}
											>
												<div className="flex items-center justify-between">
													<div>
														<CardTitle className="text-base">
															{group.baseModelName}
														</CardTitle>
														<p className="text-xs text-muted-foreground">
															{group.company}
														</p>
													</div>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
															className={`h-4 w-4 transition-transform ${
																isExpanded ? "rotate-180" : ""
															}`}
														>
															<polyline points="6 9 12 15 18 9"></polyline>
														</svg>
													</Button>
												</div>
											</CardHeader>

											{isExpanded && (
												<CardContent className="p-3 pt-0">
													<div className="space-y-1 mt-1 border-t pt-2">
														{group.versions.map((version) => (
															<div
																key={version.model_id}
																className={`flex items-center justify-between p-2.5 border rounded-md cursor-pointer transition-colors
																${
																	activePreferenceDetails?.type === "webllm" &&
																	activePreferenceDetails?.model_id ===
																		version.model_id
																		? "bg-primary/20 ring-2 ring-primary dark:bg-primary/30"
																		: "hover:bg-muted/30 dark:hover:bg-muted/20"
																}`}
																onClick={() => handleSelectWebLLM(version)}
															>
																<div>
																	<p className="font-medium text-sm">
																		{version.versionIdentifier}
																	</p>
																	<p className="text-xs text-muted-foreground">
																		VRAM: {version.vram_required_MB} MB{" "}
																		{version.low_resource_required
																			? "(Low Resource)"
																			: ""}
																	</p>
																</div>
																{activePreferenceDetails?.type === "webllm" &&
																	activePreferenceDetails?.model_id ===
																		version.model_id && (
																		<CheckCircle className="h-5 w-5 text-green-500" />
																	)}
															</div>
														))}
													</div>
												</CardContent>
											)}
										</Card>
									</div>
								);
							})}
						</div>
					</div>
					{/* Display active WebLLM model only if a WebLLM is the active preference */}
					{activePreferenceDetails?.type === "webllm" &&
						activePreferenceDetails && (
							<div className="pt-4 border-t">
								<p className="text-sm font-medium">Active WebLLM model:</p>
								<p className="text-sm text-muted-foreground">
									{activePreferenceDetails.baseModelName
										? `${activePreferenceDetails.baseModelName} (${activePreferenceDetails.versionIdentifier})`
										: activePreferenceDetails.displayName || // Fallback if baseModelName/versionIdentifier not present
										  activePreferenceDetails.model_id}
								</p>
							</div>
						)}
				</CardContent>
			</Card>

			{/* Display Current Active Preference */}
			{isPreferencesLoaded && activePreferenceDetails && (
				<Card>
					<CardHeader>
						<CardTitle>Current Active LLM Preference</CardTitle>
					</CardHeader>
					<CardContent>
						{activePreferenceDetails.type === "webllm" && (
							<div>
								<p className="text-sm font-medium">Type: WebLLM (In-Browser)</p>
								<p className="text-sm text-muted-foreground">
									Model:{" "}
									{activePreferenceDetails.baseModelName
										? `${activePreferenceDetails.baseModelName} (${activePreferenceDetails.versionIdentifier})`
										: activePreferenceDetails.displayName ||
										  activePreferenceDetails.model_id}
								</p>
							</div>
						)}
						{activePreferenceDetails.type === "api" && (
							<div>
								<p className="text-sm font-medium">Type: API Key</p>
								<p className="text-sm text-muted-foreground">
									Provider: {activePreferenceDetails.provider}
								</p>
								{activePreferenceDetails.name && (
									<p className="text-sm text-muted-foreground">
										Name: {activePreferenceDetails.name}
									</p>
								)}
								<p className="text-sm text-muted-foreground">
									Key: ••••••••{activePreferenceDetails.apiKey.slice(-4)}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
			{isPreferencesLoaded && !activePreferenceDetails && (
				<Card>
					<CardHeader>
						<CardTitle>Current Active LLM Preference</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							No active LLM preference selected. Please select a WebLLM model or
							set an API key as active to proceed.
						</p>
					</CardContent>
				</Card>
			)}

			<div className="mt-10 text-center">
				<Button
					size="lg"
					onClick={handleContinueToDashboard}
					disabled={!activePreferenceDetails && isPreferencesLoaded} // Disable if no active preference AND preferences are loaded
				>
					Continue to Dashboard
				</Button>
			</div>

			{/* API Key Dialog */}
			<Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{isEditingApiKey ? "Edit API Key" : "Add New API Key"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleApiKeyFormSubmit} className="space-y-4 py-2">
						<div>
							<Label htmlFor="apiKeyName">Custom Name (Optional)</Label>
							<Input
								id="apiKeyName"
								placeholder="e.g., My Personal OpenAI Key"
								value={currentApiKey.name}
								onChange={(e) =>
									setCurrentApiKey((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
							/>
						</div>
						<div>
							<Label htmlFor="apiKeyProvider">Provider</Label>
							<Select
								value={currentApiKey.provider}
								onValueChange={(value) =>
									setCurrentApiKey((prev) => ({ ...prev, provider: value }))
								}
							>
								<SelectTrigger id="apiKeyProvider">
									<SelectValue placeholder="Select a provider" />
								</SelectTrigger>
								<SelectContent>
									{AVAILABLE_PROVIDERS.map((p) => (
										<SelectItem key={p} value={p}>
											{p}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="apiKeyValue">API Key</Label>
							<Input
								id="apiKeyValue"
								type="password"
								placeholder="Enter your API key"
								value={currentApiKey.apiKey}
								onChange={(e) =>
									setCurrentApiKey((prev) => ({
										...prev,
										apiKey: e.target.value,
									}))
								}
								required
							/>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit">
								{isEditingApiKey ? "Save Changes" : "Add Key"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
