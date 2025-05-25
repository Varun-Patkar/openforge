"use client";

import { useState, useEffect, useRef } from "react";
import { CreateMLCEngine } from "@mlc-ai/web-llm";

export default function WebLLMProvider({
	systemPrompt,
	messages,
	userMessage,
	onResponse,
	isSending,
	modelConfig,
	settings,
	onLoadingStatusChange, // Add this prop to communicate loading status
}) {
	const [engine, setEngine] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingStatus, setLoadingStatus] = useState("Initializing WebLLM...");
	const [error, setError] = useState(null);
	const abortControllerRef = useRef(null);
	const initializationAttemptedRef = useRef(false);
	const engineRef = useRef(null);
	const processedMessageRef = useRef(null);

	// Initialize WebLLM engine on component mount
	useEffect(() => {
		// Prevent multiple initialization attempts
		if (initializationAttemptedRef.current) return;
		initializationAttemptedRef.current = true;

		let mounted = true;

		setIsLoading(true);
		// Inform parent component about loading state
		onLoadingStatusChange?.(true, "Initializing WebLLM engine...");
		setLoadingStatus("Initializing WebLLM engine...");

		async function initializeWebLLM() {
			if (!modelConfig?.model_id) {
				const errorMsg = "No model configuration provided";
				setError(errorMsg);
				onLoadingStatusChange?.(false, errorMsg, true); // true for error
				setIsLoading(false);
				return;
			}

			try {
				onLoadingStatusChange?.(
					true,
					"Loading model, this may take a moment..."
				);
				setLoadingStatus("Loading model, this may take a moment...");

				// Add error handling for the initialization
				const initPromise = CreateMLCEngine(modelConfig.model_id, {
					initProgressCallback: (progress) => {
						if (mounted) {
							const statusMsg = `Loading model: ${Math.round(
								progress.progress * 100
							)}%`;
							setLoadingStatus(statusMsg);
							onLoadingStatusChange?.(true, statusMsg);
						}
					},
					// Suppress WebGPU warnings
					logLevel: "error",
				});

				// Create a timeout promise to limit initialization time
				const timeoutPromise = new Promise((_, reject) => {
					setTimeout(
						() => reject(new Error("Model loading timed out after 60 seconds")),
						60000
					);
				});

				// Race between initialization and timeout
				const engineInstance = await Promise.race([
					initPromise,
					timeoutPromise,
				]);

				if (mounted) {
					engineRef.current = engineInstance;
					setEngine(engineInstance);
					setIsLoading(false);
					setError(null);
					onLoadingStatusChange?.(false); // Loading complete
				}
			} catch (err) {
				console.error("WebLLM initialization error:", err);
				if (mounted) {
					const errorMsg = `Failed to initialize model: ${err.message}`;
					setError(errorMsg);
					setIsLoading(false);
					onLoadingStatusChange?.(false, errorMsg, true); // true for error
				}
			}
		}

		initializeWebLLM();

		return () => {
			mounted = false;

			// Clean up initialization attempt reference on unmount
			initializationAttemptedRef.current = false;
		};
	}, []); // Empty dependency array to run only once on mount

	// Process messages when userMessage changes
	useEffect(() => {
		// Get the current engine from ref
		const currentEngine = engineRef.current || engine;

		// Skip if no engine, no message, not in sending state, or already processed this message
		if (
			!currentEngine ||
			!userMessage ||
			!isSending ||
			processedMessageRef.current === userMessage
		) {
			return;
		}

		// Mark this message as being processed to prevent duplicates
		processedMessageRef.current = userMessage;

		let mounted = true;
		abortControllerRef.current = new AbortController();

		async function processMessage() {
			try {
				// Reset any previous errors
				setError(null);

				// Format messages for the API
				const formattedMessages = [];

				// Add system prompt if available
				if (systemPrompt) {
					formattedMessages.push({ role: "system", content: systemPrompt });
				}

				// Filter messages based on context window setting
				const contextCount = settings?.contextMessagesCount || 3;

				// Get previous messages to include (exclude the latest user message which we'll add separately)
				if (messages && messages.length > 0) {
					// Get messages up to but not including the last one (which we'll handle separately)
					const previousMessages = messages.slice(0, -1);

					// Filter to get appropriate context window
					const userMessages = previousMessages.filter(
						(m) => m.role === "user"
					);
					const assistantMessages = previousMessages.filter(
						(m) => m.role === "assistant"
					);

					// Get last N of each type
					const limitedUserMessages = userMessages.slice(-contextCount);
					const limitedAssistantMessages = assistantMessages.slice(
						-contextCount
					);

					// Combine and sort by original position
					const contextMessages = [
						...limitedUserMessages,
						...limitedAssistantMessages,
					].sort((a, b) => {
						const aIndex = previousMessages.findIndex((m) => m === a);
						const bIndex = previousMessages.findIndex((m) => m === b);
						return aIndex - bIndex;
					});

					// Add to formatted messages
					formattedMessages.push(...contextMessages);
				}

				// Add current user message - ONLY ONCE
				formattedMessages.push({ role: "user", content: userMessage });

				// Generate response with streaming
				const chunks = await currentEngine.chat.completions.create({
					messages: formattedMessages,
					temperature: settings?.temperature || 0.7,
					top_p: settings?.topP || 0.9,
					stream: true,
					stream_options: { include_usage: true },
				});

				// Stream the response
				let reply = "";
				for await (const chunk of chunks) {
					if (abortControllerRef.current?.signal.aborted) break;

					const content = chunk.choices[0]?.delta.content || "";
					reply += content;
				}

				if (mounted && !abortControllerRef.current?.signal.aborted) {
					// Get the final complete message for consistency
					let finalResponse = reply;
					try {
						const fullResponse = await currentEngine.getMessage();
						if (fullResponse) {
							finalResponse = fullResponse;
						}
					} catch (err) {
						// Ignore error, use streamed response
					}

					if (finalResponse.trim()) {
						onResponse(finalResponse);
					} else {
						console.error("Empty response from WebLLM");
						onResponse(
							"Sorry, I couldn't generate a response. Please try again."
						);
					}
				}
			} catch (err) {
				if (err.name === "AbortError") {
					// Ignore abort errors
				} else {
					console.error("WebLLM generation error:", err);
					if (mounted) {
						setError(`Failed to generate response: ${err.message}`);
						// Still need to call onResponse to update UI state
						onResponse(`Error generating response: ${err.message}`);
					}
				}
			} finally {
				// Reset the processed message reference once we're done with this message
				if (processedMessageRef.current === userMessage) {
					processedMessageRef.current = null;
				}
			}
		}

		processMessage();

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [
		engine,
		userMessage,
		isSending,
		onResponse,
		settings,
		systemPrompt,
		messages,
	]);

	// Show loading status in the UI
	if (isLoading) {
		return (
			<div className="fixed bottom-20 right-4 bg-card p-4 rounded-lg shadow-lg border z-50 max-w-sm">
				<div className="flex items-center space-x-2">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
					<p className="text-sm">{loadingStatus}</p>
				</div>
			</div>
		);
	}

	// Show error in the UI if there's one
	if (error) {
		return (
			<div className="fixed bottom-20 right-4 bg-destructive/10 p-4 rounded-lg shadow-lg border border-destructive z-50 max-w-sm">
				<p className="text-sm text-destructive">{error}</p>
			</div>
		);
	}

	// Return nothing if everything is fine (component is just for handling the WebLLM logic)
	return null;
}
