// Placeholder for modelLibURLPrefix and modelVersion if they were dynamic
// For now, we assume model_lib in the list is the final or usable string.
// const modelLibURLPrefix = "some_prefix/"; // Example: "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm-models@";
// const modelVersion = "v0.2.30"; // Example: Get this from WebLLM's actual versioning

export const ModelType = {
	VLM: "vlm",
	EMBEDDING: "embedding",
	LLM: "llm", // Default for models without a specific type
};

// IMPORTANT: You MUST paste the full `model_list` from the prompt into `rawModelList`.
// The example below is heavily truncated and uses placeholders.
// Also, the `model_lib` construction needs to be handled based on
// how `modelLibURLPrefix` and `modelVersion` are actually defined and used in your project.
// If `model_lib` in your source list is already a full URL, you can use it directly.
// Otherwise, you'll need to construct it, e.g., by concatenating a base URL with model_lib_path_suffix.
const modelLibURLPrefix = ""; // Set your actual prefix if needed
const modelVersion = ""; // Set your actual version if needed

const rawModelList = [
	// Llama-3.2
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC",
		model_id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3.2-1B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1128.82,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC",
		model_id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3.2-1B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 879.04,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q0f32-MLC",
		model_id: "Llama-3.2-1B-Instruct-q0f32-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3.2-1B-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5106.26,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q0f16-MLC",
		model_id: "Llama-3.2-1B-Instruct-q0f16-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3.2-1B-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2573.13,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f32_1-MLC",
		model_id: "Llama-3.2-3B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3.2-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2951.51,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f16_1-MLC",
		model_id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3.2-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2263.69,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Llama-3.1
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f32_1-MLC",
		model_id: "Llama-3.1-8B-Instruct-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3_1-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5295.7,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f16_1-MLC",
		model_id: "Llama-3.1-8B-Instruct-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3_1-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4598.34,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f32_1-MLC",
		model_id: "Llama-3.1-8B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3_1-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 6101.01,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f16_1-MLC",
		model_id: "Llama-3.1-8B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3_1-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5001.0,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	// DeepSeek-R1-Distill-Qwen
	// TODO(Charlie): Qwen2-1.5B is experiencing correctness issue, hence commented for now.
	// {
	//   model: "https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC",
	//   model_id: "DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC",
	//   model_lib:
	//     modelLibURLPrefix +
	//     modelVersion +
	//     "/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
	//   low_resource_required: true,
	//   vram_required_MB: 1629.75,
	//   overrides: {
	//     context_window_size: 4096,
	//   },
	// },
	// {
	//   model: "https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Qwen-1.5B-q4f32_1-MLC",
	//   model_id: "DeepSeek-R1-Distill-Qwen-1.5B-q4f32_1-MLC",
	//   model_lib:
	//     modelLibURLPrefix +
	//     modelVersion +
	//     "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
	//   low_resource_required: true,
	//   vram_required_MB: 1888.97,
	//   overrides: {
	//     context_window_size: 4096,
	//   },
	// },
	{
		model:
			"https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC",
		model_id: "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5106.67,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC",
		model_id: "DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5900.09,
		overrides: {
			context_window_size: 4096,
		},
	},
	// DeepSeek-R1-Distill-Llama
	{
		model:
			"https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Llama-8B-q4f32_1-MLC",
		model_id: "DeepSeek-R1-Distill-Llama-8B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3_1-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 6101.01,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC",
		model_id: "DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3_1-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5001.0,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Hermes-3 and Hermes-2
	{
		model:
			"https://huggingface.co/mlc-ai/Hermes-2-Theta-Llama-3-8B-q4f16_1-MLC",
		model_id: "Hermes-2-Theta-Llama-3-8B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4976.13,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Hermes-2-Theta-Llama-3-8B-q4f32_1-MLC",
		model_id: "Hermes-2-Theta-Llama-3-8B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 6051.27,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
		model_id: "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4976.13,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC",
		model_id: "Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 6051.27,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Hermes-3-Llama-3.2-3B-q4f32_1-MLC",
		model_id: "Hermes-3-Llama-3.2-3B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3.2-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2951.51,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Hermes-3-Llama-3.2-3B-q4f16_1-MLC",
		model_id: "Hermes-3-Llama-3.2-3B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3.2-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2263.69,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Hermes-3-Llama-3.1-8B-q4f32_1-MLC",
		model_id: "Hermes-3-Llama-3.1-8B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3_1-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5779.27,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Hermes-3-Llama-3.1-8B-q4f16_1-MLC",
		model_id: "Hermes-3-Llama-3.1-8B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3_1-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4876.13,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
		model_id: "Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4033.28,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
			sliding_window_size: -1,
		},
	},
	// Phi3.5-mini-instruct
	{
		model: "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC",
		model_id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3.5-mini-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 3672.07,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f32_1-MLC",
		model_id: "Phi-3.5-mini-instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3.5-mini-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5483.12,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC",
		model_id: "Phi-3.5-mini-instruct-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3.5-mini-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2520.07,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f32_1-MLC",
		model_id: "Phi-3.5-mini-instruct-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3.5-mini-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 3179.12,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	// Phi-3.5-vision-instruct
	{
		model: "https://huggingface.co/mlc-ai/Phi-3.5-vision-instruct-q4f16_1-MLC",
		model_id: "Phi-3.5-vision-instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3.5-vision-instruct-q4f16_1-ctx4k_cs2k-webgpu.wasm",
		vram_required_MB: 3952.18,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
		model_type: ModelType.VLM,
	},
	{
		model: "https://huggingface.co/mlc-ai/Phi-3.5-vision-instruct-q4f32_1-MLC",
		model_id: "Phi-3.5-vision-instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3.5-vision-instruct-q4f32_1-ctx4k_cs2k-webgpu.wasm",
		vram_required_MB: 5879.84,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
		model_type: ModelType.VLM,
	},
	// Mistral variants
	{
		model: "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
		model_id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4573.39,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
			sliding_window_size: -1,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f32_1-MLC",
		model_id: "Mistral-7B-Instruct-v0.3-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Mistral-7B-Instruct-v0.3-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5619.27,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
			sliding_window_size: -1,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
		model_id: "Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4573.39,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
			sliding_window_size: -1,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/OpenHermes-2.5-Mistral-7B-q4f16_1-MLC",
		model_id: "OpenHermes-2.5-Mistral-7B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4573.39,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
			sliding_window_size: -1,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/NeuralHermes-2.5-Mistral-7B-q4f16_1-MLC",
		model_id: "NeuralHermes-2.5-Mistral-7B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4573.39,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
			sliding_window_size: -1,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/WizardMath-7B-V1.1-q4f16_1-MLC",
		model_id: "WizardMath-7B-V1.1-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Mistral-7B-Instruct-v0.3-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4573.39,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
			sliding_window_size: -1,
		},
	},
	// SmolLM2
	{
		model: "https://huggingface.co/mlc-ai/SmolLM2-1.7B-Instruct-q4f16_1-MLC",
		model_id: "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/SmolLM2-1.7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1774.19,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/SmolLM2-1.7B-Instruct-q4f32_1-MLC",
		model_id: "SmolLM2-1.7B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/SmolLM2-1.7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2692.38,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},

	{
		model: "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q0f16-MLC",
		model_id: "SmolLM2-360M-Instruct-q0f16-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/SmolLM2-360M-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 871.99,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q0f32-MLC",
		model_id: "SmolLM2-360M-Instruct-q0f32-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/SmolLM2-360M-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1743.99,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f16_1-MLC",
		model_id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/SmolLM2-360M-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 376.06,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f32_1-MLC",
		model_id: "SmolLM2-360M-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/SmolLM2-360M-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 579.61,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/SmolLM2-135M-Instruct-q0f16-MLC",
		model_id: "SmolLM2-135M-Instruct-q0f16-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/SmolLM2-135M-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 359.69,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/SmolLM2-135M-Instruct-q0f32-MLC",
		model_id: "SmolLM2-135M-Instruct-q0f32-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/SmolLM2-135M-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 719.38,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Gemma2
	{
		model: "https://huggingface.co/mlc-ai/gemma-2-2b-it-q4f16_1-MLC",
		model_id: "gemma-2-2b-it-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1895.3,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/gemma-2-2b-it-q4f32_1-MLC",
		model_id: "gemma-2-2b-it-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2508.75,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/gemma-2-2b-it-q4f16_1-MLC",
		model_id: "gemma-2-2b-it-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1583.3,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/gemma-2-2b-it-q4f32_1-MLC",
		model_id: "gemma-2-2b-it-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1884.75,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/gemma-2-9b-it-q4f16_1-MLC",
		model_id: "gemma-2-9b-it-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2-9b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 6422.01,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/gemma-2-9b-it-q4f32_1-MLC",
		model_id: "gemma-2-9b-it-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2-9b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 8383.33,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Gemma2-2b-jpn
	{
		model: "https://huggingface.co/mlc-ai/gemma-2-2b-jpn-it-q4f16_1-MLC",
		model_id: "gemma-2-2b-jpn-it-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2-2b-jpn-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1895.3,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/gemma-2-2b-jpn-it-q4f32_1-MLC",
		model_id: "gemma-2-2b-jpn-it-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2-2b-jpn-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2508.75,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Qwen-3
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-0.6B-q4f16_1-MLC",
		model_id: "Qwen3-0.6B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-0.6B-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1403.34,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-0.6B-q4f32_1-MLC",
		model_id: "Qwen3-0.6B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-0.6B-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1924.98,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-0.6B-q0f16-MLC",
		model_id: "Qwen3-0.6B-q0f16-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-0.6B-q0f16-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2220.38,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-0.6B-q0f32-MLC",
		model_id: "Qwen3-0.6B-q0f32-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-0.6B-q0f32-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 3843.25,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-1.7B-q4f16_1-MLC",
		model_id: "Qwen3-1.7B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-1.7B-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2036.66,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-1.7B-q4f32_1-MLC",
		model_id: "Qwen3-1.7B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-1.7B-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2635.44,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-4B-q4f16_1-MLC",
		model_id: "Qwen3-4B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-4B-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 3431.59,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-4B-q4f32_1-MLC",
		model_id: "Qwen3-4B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-4B-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4327.71,
		low_resource_required: true,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-8B-q4f16_1-MLC",
		model_id: "Qwen3-8B-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-8B-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5695.78,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen3-8B-q4f32_1-MLC",
		model_id: "Qwen3-8B-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen3-8B-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 6852.55,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Qwen-2
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 944.62,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2.5-0.5B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1060.2,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q0f16-MLC",
		model_id: "Qwen2.5-0.5B-Instruct-q0f16-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1624.12,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q0f32-MLC",
		model_id: "Qwen2.5-0.5B-Instruct-q0f32-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 2654.75,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1629.75,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2.5-1.5B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1888.97,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-3B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2.5-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 2504.76,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-3B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2.5-3B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2.5-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 2893.64,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-7B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2.5-7B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5106.67,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2.5-7B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2.5-7B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5900.09,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Qwen2.5-Coder
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 944.62,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-0.5B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2.5-Coder-0.5B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1060.2,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-0.5B-Instruct-q0f16-MLC",
		model_id: "Qwen2.5-Coder-0.5B-Instruct-q0f16-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1624.12,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-0.5B-Instruct-q0f32-MLC",
		model_id: "Qwen2.5-Coder-0.5B-Instruct-q0f32-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 2654.75,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 1629.75,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 1888.97,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2.5-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 2504.76,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2.5-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 2893.64,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5106.67,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5900.09,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Qwen2.5-Math
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1629.75,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/Qwen2.5-Math-1.5B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2.5-Math-1.5B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1888.97,
		overrides: {
			context_window_size: 4096,
		},
	},
	// StableLM-zephyr-1.6B
	{
		model: "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f16_1-MLC",
		model_id: "stablelm-2-zephyr-1_6b-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/stablelm-2-zephyr-1_6b-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2087.66,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f32_1-MLC",
		model_id: "stablelm-2-zephyr-1_6b-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/stablelm-2-zephyr-1_6b-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2999.33,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f16_1-MLC",
		model_id: "stablelm-2-zephyr-1_6b-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/stablelm-2-zephyr-1_6b-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1511.66,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/stablelm-2-zephyr-1_6b-q4f32_1-MLC",
		model_id: "stablelm-2-zephyr-1_6b-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/stablelm-2-zephyr-1_6b-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1847.33,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	// RedPajama
	{
		model:
			"https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
		model_id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/RedPajama-INCITE-Chat-3B-v1-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 2972.09,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
		model_id: "RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/RedPajama-INCITE-Chat-3B-v1-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 3928.09,
		low_resource_required: false,
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
		model_id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/RedPajama-INCITE-Chat-3B-v1-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 2041.09,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model:
			"https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
		model_id: "RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/RedPajama-INCITE-Chat-3B-v1-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 2558.09,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	// TinyLlama v1.0
	{
		model: "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
		model_id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/TinyLlama-1.1B-Chat-v1.0-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 697.24,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
		model_id: "TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/TinyLlama-1.1B-Chat-v1.0-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 839.98,
		low_resource_required: true,
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
		model_id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/TinyLlama-1.1B-Chat-v1.0-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 675.24,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC",
		model_id: "TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/TinyLlama-1.1B-Chat-v1.0-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 795.98,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	// BELOW ARE MODELS OF OLDER VERSIONS OR NOT AS PRACTICAL
	// Llama-3.1 70B
	{
		model: "https://huggingface.co/mlc-ai/Llama-3.1-70B-Instruct-q3f16_1-MLC",
		model_id: "Llama-3.1-70B-Instruct-q3f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3_1-70B-Instruct-q3f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 31153.13,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Qwen-2
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-0.5B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2-0.5B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 944.62,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-0.5B-Instruct-q0f16-MLC",
		model_id: "Qwen2-0.5B-Instruct-q0f16-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q0f16-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1624.12,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-0.5B-Instruct-q0f32-MLC",
		model_id: "Qwen2-0.5B-Instruct-q0f32-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-0.5B-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 2654.75,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-1.5B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2-1.5B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1629.75,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-1.5B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2-1.5B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1888.97,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-7B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2-7B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5106.67,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-7B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2-7B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5900.09,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Qwen2-Math
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-Math-1.5B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2-Math-1.5B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1629.75,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-Math-1.5B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2-Math-1.5B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: true,
		vram_required_MB: 1888.97,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-Math-7B-Instruct-q4f16_1-MLC",
		model_id: "Qwen2-Math-7B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5106.67,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Qwen2-Math-7B-Instruct-q4f32_1-MLC",
		model_id: "Qwen2-Math-7B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Qwen2-7B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		low_resource_required: false,
		vram_required_MB: 5900.09,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Llama-3
	{
		model: "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f32_1-MLC",
		model_id: "Llama-3-8B-Instruct-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5295.7,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC",
		model_id: "Llama-3-8B-Instruct-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4598.34,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f32_1-MLC",
		model_id: "Llama-3-8B-Instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 6101.01,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f16_1-MLC",
		model_id: "Llama-3-8B-Instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3-8B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5001.0,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-3-70B-Instruct-q3f16_1-MLC",
		model_id: "Llama-3-70B-Instruct-q3f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-3-70B-Instruct-q3f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 31153.13,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	// Phi3-mini-instruct
	{
		model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f16_1-MLC",
		model_id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3-mini-4k-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 3672.07,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f32_1-MLC",
		model_id: "Phi-3-mini-4k-instruct-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3-mini-4k-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5483.12,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f16_1-MLC",
		model_id: "Phi-3-mini-4k-instruct-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3-mini-4k-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 2520.07,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f32_1-MLC",
		model_id: "Phi-3-mini-4k-instruct-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Phi-3-mini-4k-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 3179.12,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	// Llama-2
	{
		model: "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1-MLC",
		model_id: "Llama-2-7b-chat-hf-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 5284.01,
		low_resource_required: false,
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f16_1-MLC",
		model_id: "Llama-2-7b-chat-hf-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-2-7b-chat-hf-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 4618.52,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1-MLC",
		model_id: "Llama-2-7b-chat-hf-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 9109.03,
		low_resource_required: false,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f16_1-MLC",
		model_id: "Llama-2-7b-chat-hf-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-2-7b-chat-hf-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 6749.02,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/Llama-2-13b-chat-hf-q4f16_1-MLC",
		model_id: "Llama-2-13b-chat-hf-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/Llama-2-13b-chat-hf-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 11814.09,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	// Gemma-2B
	{
		model: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f16_1-MLC",
		model_id: "gemma-2b-it-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1476.52,
		low_resource_required: false,
		buffer_size_required_bytes: 262144000,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f32_1-MLC",
		model_id: "gemma-2b-it-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1750.66,
		low_resource_required: false,
		buffer_size_required_bytes: 262144000,
		overrides: {
			context_window_size: 4096,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f16_1-MLC",
		model_id: "gemma-2b-it-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1476.52,
		low_resource_required: true,
		buffer_size_required_bytes: 262144000,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f32_1-MLC",
		model_id: "gemma-2b-it-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/gemma-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
		vram_required_MB: 1750.66,
		low_resource_required: true,
		buffer_size_required_bytes: 262144000,
		overrides: {
			context_window_size: 1024,
		},
	},
	// Phi-2
	{
		model: "https://huggingface.co/mlc-ai/phi-2-q4f16_1-MLC",
		model_id: "phi-2-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/phi-2-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 3053.97,
		low_resource_required: false,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/phi-2-q4f32_1-MLC",
		model_id: "phi-2-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/phi-2-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 4032.48,
		low_resource_required: false,
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/phi-2-q4f16_1-MLC",
		model_id: "phi-2-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/phi-2-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 2131.97,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/phi-2-q4f32_1-MLC",
		model_id: "phi-2-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/phi-2-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 2740.48,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	// Phi-1.5
	{
		model: "https://huggingface.co/mlc-ai/phi-1_5-q4f16_1-MLC",
		model_id: "phi-1_5-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/phi-1_5-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 1210.09,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/phi-1_5-q4f32_1-MLC",
		model_id: "phi-1_5-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/phi-1_5-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 1682.09,
		low_resource_required: true,
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/phi-1_5-q4f16_1-MLC",
		model_id: "phi-1_5-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/phi-1_5-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 1210.09,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/phi-1_5-q4f32_1-MLC",
		model_id: "phi-1_5-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/phi-1_5-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 1682.09,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	// TinyLlama v0.4
	{
		model: "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
		model_id: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/TinyLlama-1.1B-Chat-v0.4-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 697.24,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
		model_id: "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/TinyLlama-1.1B-Chat-v0.4-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 839.98,
		low_resource_required: true,
		overrides: {
			context_window_size: 2048,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
		model_id: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/TinyLlama-1.1B-Chat-v0.4-q4f16_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 675.24,
		low_resource_required: true,
		required_features: ["shader-f16"],
		overrides: {
			context_window_size: 1024,
		},
	},
	{
		model: "https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
		model_id: "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC-1k",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/TinyLlama-1.1B-Chat-v0.4-q4f32_1-ctx2k_cs1k-webgpu.wasm",
		vram_required_MB: 795.98,
		low_resource_required: true,
		overrides: {
			context_window_size: 1024,
		},
	},
	// Embedding models
	// -b means max_batch_size this model allows. The smaller it is, the less memory the model consumes.
	{
		model: "https://huggingface.co/mlc-ai/snowflake-arctic-embed-m-q0f32-MLC",
		model_id: "snowflake-arctic-embed-m-q0f32-MLC-b32",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/snowflake-arctic-embed-m-q0f32-ctx512_cs512_batch32-webgpu.wasm",
		vram_required_MB: 1407.51,
		model_type: ModelType.embedding,
	},
	{
		model: "https://huggingface.co/mlc-ai/snowflake-arctic-embed-m-q0f32-MLC",
		model_id: "snowflake-arctic-embed-m-q0f32-MLC-b4",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/snowflake-arctic-embed-m-q0f32-ctx512_cs512_batch4-webgpu.wasm",
		vram_required_MB: 539.4,
		model_type: ModelType.embedding,
	},
	{
		model: "https://huggingface.co/mlc-ai/snowflake-arctic-embed-s-q0f32-MLC",
		model_id: "snowflake-arctic-embed-s-q0f32-MLC-b32",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/snowflake-arctic-embed-s-q0f32-ctx512_cs512_batch32-webgpu.wasm",
		vram_required_MB: 1022.82,
		model_type: ModelType.embedding,
	},
	{
		model: "https://huggingface.co/mlc-ai/snowflake-arctic-embed-s-q0f32-MLC",
		model_id: "snowflake-arctic-embed-s-q0f32-MLC-b4",
		model_lib:
			modelLibURLPrefix +
			modelVersion +
			"/snowflake-arctic-embed-s-q0f32-ctx512_cs512_batch4-webgpu.wasm",
		vram_required_MB: 238.71,
		model_type: ModelType.embedding,
	},
];

const extractCompany = (modelId) => {
	if (!modelId) return "Unknown";
	const lowerId = modelId.toLowerCase();
	if (lowerId.includes("llama")) return "Llama"; // Broader check for Llama
	if (lowerId.startsWith("qwen")) return "Qwen";
	if (lowerId.startsWith("phi")) return "Phi";
	if (lowerId.startsWith("gemma")) return "Gemma";
	if (lowerId.startsWith("mistral")) return "Mistral";
	if (lowerId.startsWith("hermes")) return "Hermes";
	if (lowerId.startsWith("redpajama")) return "RedPajama";
	if (lowerId.startsWith("stablelm")) return "StableLM";
	if (lowerId.startsWith("smollm")) return "SmolLM";
	if (lowerId.startsWith("deepseek")) return "DeepSeek";
	if (lowerId.startsWith("snowflake")) return "Snowflake";
	// Add more heuristics if needed
	const parts = modelId.split(/[-_]/);
	return parts[0] || "Unknown";
};

// Regex to separate base model name from version/quantization string
// Captures: 1. Base Name (everything before the last "-q")
//           2. Version Identifier (the "q" and everything after it from the last "-q")
const modelNameRegex = /^(.*)-(q.*)$/;

const processedModels = rawModelList
	.filter((m) => {
		// Include if model_type is explicitly VLM,
		// or if model_type is explicitly LLM,
		// or if model_type is undefined/null (treat as default LLM).
		// Exclude if model_type is EMBEDDING or any other specific type not LLM/VLM.
		return (
			m.model_type === ModelType.VLM ||
			m.model_type === ModelType.LLM ||
			m.model_type === undefined ||
			m.model_type === null
		);
	})
	.map((m) => {
		let baseModelName = m.model_id; // Default to full model_id
		let versionIdentifier = "Default"; // Default version identifier

		const match = m.model_id.match(modelNameRegex);
		if (match && match[1] && match[2]) {
			baseModelName = match[1];
			versionIdentifier = match[2];
		} else {
			// If the regex doesn't match, it means the model_id doesn't end
			// with the standard quantization pattern we're looking for.
			// We'll use the full model_id as the base name and a generic version identifier.
			// This simplifies the fallback compared to trying to re-parse.
			baseModelName = m.model_id;
			versionIdentifier = "UnknownVersion"; // Or any other suitable generic identifier
			// Optional: Log a warning for model_ids that don't match, for review
			// console.warn(
			//  `Model ID "${m.model_id}" did not match standard quantization pattern. Using full ID as base name.`
			// );
		}

		return {
			...m,
			company: extractCompany(m.model_id), // Company based on full model_id
			baseModelName: baseModelName,
			versionIdentifier: versionIdentifier,
			// model_lib: m.model_lib, // Already present
			// displayName will be handled by the group
		};
	});

const groupedModels = processedModels.reduce((acc, currentModel) => {
	const { baseModelName, company, ...versionDetails } = currentModel;
	let group = acc.find((g) => g.baseModelName === baseModelName);

	if (!group) {
		group = {
			baseModelName: baseModelName,
			company: company, // Use company from the first model of the group
			versions: [],
		};
		acc.push(group);
	}
	group.versions.push({
		...versionDetails, // This includes original model_id, vram, model_lib, etc.
		// versionIdentifier is already part of versionDetails
	});
	return acc;
}, []);

export const webllmModels = groupedModels;

export const webllmModelCompanies = [
	...new Set(webllmModels.map((m) => m.company)),
].sort();
