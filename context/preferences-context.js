"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import { webllmModels } from "@/lib/webllm-models";
import { useAuth } from "@/context/auth-context"; // Import useAuth

const PreferencesContext = createContext(undefined);

const initialPreferencesState = {
	apiKeys: [],
	selectedWebLLM: null,
	activePreference: null,
};

export const PreferencesProvider = ({ children }) => {
	const [preferences, setPreferences] = useState(initialPreferencesState);
	const [isLoaded, setIsLoaded] = useState(false);
	const { status: authStatus } = useAuth(); // Get auth status

	// Helper function to save all preferences to DB
	const savePreferencesToDB = async (currentPrefs) => {
		// Only attempt to save if authenticated
		if (authStatus !== "authenticated") {
			console.log(
				"User not authenticated. Preferences will not be saved to DB."
			);
			return;
		}
		try {
			const payload = {
				apiKeys: currentPrefs.apiKeys,
				activePreference: currentPrefs.activePreference,
			};
			const response = await fetch("/api/user/preferences", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!response.ok) {
				const errorData = await response.json();
				console.error(
					"Failed to save preferences to DB:",
					response.status,
					errorData.message
				);
			}
		} catch (error) {
			console.error("Error saving preferences to DB:", error);
		}
	};

	// Load preferences from DB or localStorage based on auth status
	useEffect(() => {
		const loadUserPreferences = async () => {
			setIsLoaded(false); // Indicate loading starts

			if (authStatus === "authenticated") {
				try {
					const response = await fetch("/api/user/preferences");
					if (response.ok) {
						const dbPrefs = await response.json();
						setPreferences((prev) => ({
							...prev,
							apiKeys: dbPrefs.apiKeys || [],
							activePreference: dbPrefs.activePreference || null,
						}));
						// If activePreference is webllm, try to populate selectedWebLLM
						if (
							dbPrefs.activePreference?.type === "webllm" &&
							dbPrefs.activePreference.model_id
						) {
							const modelDetails = webllmModels
								.flatMap((group) => group.versions)
								.find((v) => v.model_id === dbPrefs.activePreference.model_id);
							if (modelDetails) {
								setPreferences((prev) => ({
									...prev,
									selectedWebLLM: { ...modelDetails },
								}));
							}
						}
					} else {
						console.error(
							"Failed to load preferences from DB for authenticated user, status:",
							response.status
						);
						// Fallback or set to initial if DB load fails
						setPreferences(initialPreferencesState);
					}
				} catch (error) {
					console.error("Error fetching preferences from DB:", error);
					setPreferences(initialPreferencesState);
				} finally {
					setIsLoaded(true);
				}
			} else if (authStatus === "unauthenticated") {
				console.log(
					"User not authenticated, loading non-sensitive preferences from localStorage."
				);
				const storedLocalPrefs = localStorage.getItem(
					"llmPreferences_anonymous"
				);
				if (storedLocalPrefs) {
					try {
						const parsed = JSON.parse(storedLocalPrefs);
						setPreferences((prev) => ({
							...prev,
							activePreference: parsed.activePreference || null,
							selectedWebLLM: parsed.selectedWebLLM || null,
							apiKeys: [], // API keys are not for anonymous users
						}));
					} catch (e) {
						console.error(
							"Failed to parse anonymous preferences from localStorage",
							e
						);
						setPreferences(initialPreferencesState);
					}
				} else {
					setPreferences(initialPreferencesState);
				}
				setIsLoaded(true);
			}
			// If authStatus is "loading", we wait. setIsLoaded(true) will be called when authStatus resolves.
		};

		if (authStatus !== "loading") {
			loadUserPreferences();
		}
	}, [authStatus]); // Re-run when authStatus changes (e.g., from loading to authenticated)

	// Persist non-sensitive parts to localStorage for anonymous/quick UI
	useEffect(() => {
		if (authStatus === "unauthenticated" && isLoaded) {
			const localData = {
				activePreference: preferences.activePreference,
				selectedWebLLM: preferences.selectedWebLLM,
			};
			localStorage.setItem(
				"llmPreferences_anonymous",
				JSON.stringify(localData)
			);
		}
	}, [
		preferences.activePreference,
		preferences.selectedWebLLM,
		isLoaded,
		authStatus,
	]);

	const addApiKey = (apiKeyData) => {
		const newApiKey = {
			id: Date.now().toString(),
			...apiKeyData,
		};
		setPreferences((prev) => {
			const updatedPrefs = {
				...prev,
				apiKeys: [...prev.apiKeys, newApiKey],
			};
			savePreferencesToDB(updatedPrefs); // savePreferencesToDB will check authStatus
			return updatedPrefs;
		});
		return newApiKey;
	};

	const updateApiKey = (id, updates) => {
		setPreferences((prev) => {
			const updatedApiKeys = prev.apiKeys.map((key) =>
				key.id === id ? { ...key, ...updates } : key
			);
			const updatedPrefs = {
				...prev,
				apiKeys: updatedApiKeys,
			};
			savePreferencesToDB(updatedPrefs);
			return updatedPrefs;
		});
	};

	const deleteApiKey = (id) => {
		setPreferences((prev) => {
			const newApiKeys = prev.apiKeys.filter((key) => key.id !== id);
			let newActivePreference = prev.activePreference;
			if (
				prev.activePreference?.type === "api" &&
				prev.activePreference?.id === id
			) {
				newActivePreference = null;
			}
			const updatedPrefs = {
				...prev,
				apiKeys: newApiKeys,
				activePreference: newActivePreference,
			};
			savePreferencesToDB(updatedPrefs);
			return updatedPrefs;
		});
	};

	const selectWebLLM = (modelConfig) => {
		// This function now directly updates activePreference and selectedWebLLM
		// then calls savePreferencesToDB if authenticated.
		const activePrefPayload = {
			type: "webllm",
			model_id: modelConfig.model_id,
		};
		setPreferences((prev) => {
			const updatedPrefs = {
				...prev,
				selectedWebLLM: modelConfig ? { ...modelConfig } : null,
				activePreference: activePrefPayload,
			};
			savePreferencesToDB(updatedPrefs);
			return updatedPrefs;
		});
	};

	const setActivePreference = (activePref) => {
		setPreferences((prev) => {
			const updatedPrefs = {
				...prev,
				activePreference: activePref,
			};
			if (activePref?.type === "webllm" && activePref.model_id) {
				const modelDetails = webllmModels
					.flatMap((group) => group.versions)
					.find((v) => v.model_id === activePref.model_id);
				if (modelDetails) {
					updatedPrefs.selectedWebLLM = { ...modelDetails };
				}
			} else if (activePref?.type === "api") {
				// When an API key becomes active, clear the selectedWebLLM UI hint
				updatedPrefs.selectedWebLLM = null;
			}
			savePreferencesToDB(updatedPrefs);
			return updatedPrefs;
		});
	};

	const getActivePreferenceDetails = useCallback(() => {
		if (!preferences.activePreference) {
			return null;
		}
		const { type, id, model_id } = preferences.activePreference;

		if (type === "api") {
			const apiKey = preferences.apiKeys.find((k) => k.id === id);
			return apiKey ? { ...apiKey, type: "api" } : null; // Add type: 'api'
		}
		if (type === "webllm") {
			for (const group of webllmModels) {
				const model = group.versions.find((v) => v.model_id === model_id);
				if (model) {
					// Ensure all relevant fields from model are spread, then add type
					return { ...model, type: "webllm" }; // Add type: 'webllm'
				}
			}
			return null; // Model not found
		}
		return null;
	}, [preferences.activePreference, preferences.apiKeys]); // webllmModels is stable

	return (
		<PreferencesContext.Provider
			value={{
				preferences,
				isPreferencesLoaded: isLoaded && authStatus !== "loading", // True when auth is resolved & data attempted to load
				addApiKey,
				updateApiKey,
				deleteApiKey,
				selectWebLLM,
				setActivePreference,
				getActivePreferenceDetails,
			}}
		>
			{children}
		</PreferencesContext.Provider>
	);
};

export const usePreferences = () => {
	const context = useContext(PreferencesContext);
	if (context === undefined) {
		throw new Error("usePreferences must be used within a PreferencesProvider");
	}
	return context;
};
