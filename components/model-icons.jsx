import React from "react";
import Image from "next/image";

export const LlamaIcon = ({ className = "h-6 w-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 48 48"
		className={className}
	>
		<path
			fill="#0081fb"
			d="M47,29.36l-2.193,1.663L42.62,29.5c0-0.16,0-0.33-0.01-0.5c0-0.16,0-0.33-0.01-0.5	c-0.14-3.94-1.14-8.16-3.14-11.25c-1.54-2.37-3.51-3.5-5.71-3.5c-2.31,0-4.19,1.38-6.27,4.38c-0.06,0.09-0.13,0.18-0.19,0.28	c-0.04,0.05-0.07,0.1-0.11,0.16c-0.1,0.15-0.2,0.3-0.3,0.46c-0.9,1.4-1.84,3.03-2.86,4.83c-0.09,0.17-0.19,0.34-0.28,0.51	c-0.03,0.04-0.06,0.09-0.08,0.13l-0.21,0.37l-1.24,2.19c-2.91,5.15-3.65,6.33-5.1,8.26C14.56,38.71,12.38,40,9.51,40	c-3.4,0-5.56-1.47-6.89-3.69C1.53,34.51,1,32.14,1,29.44l4.97,0.17c0,1.76,0.38,3.1,0.89,3.92C7.52,34.59,8.49,35,9.5,35	c1.29,0,2.49-0.27,4.77-3.43c1.83-2.53,3.99-6.07,5.44-8.3l1.37-2.09l0.29-0.46l0.3-0.45l0.5-0.77c0.76-1.16,1.58-2.39,2.46-3.57	c0.1-0.14,0.2-0.28,0.31-0.42c0.1-0.14,0.21-0.28,0.31-0.41c0.9-1.15,1.85-2.22,2.87-3.1c1.85-1.61,3.84-2.5,5.85-2.5	c3.37,0,6.58,1.95,9.04,5.61c2.51,3.74,3.82,8.4,3.97,13.25c0.01,0.16,0.01,0.33,0.01,0.5C47,29.03,47,29.19,47,29.36z"
		></path>
		<path
			fill="#0064e1"
			d="M4.918,15.456	C7.195,11.951,10.483,9.5,14.253,9.5c2.184,0,4.354,0.645,6.621,2.493c2.479,2.02,5.122,5.346,8.419,10.828l1.182,1.967	c2.854,4.746,4.477,7.187,5.428,8.339C37.125,34.606,37.888,35,39,35c2.82,0,3.617-2.54,3.617-5.501L47,29.362	c0,3.095-0.611,5.369-1.651,7.165C44.345,38.264,42.387,40,39.093,40c-2.048,0-3.862-0.444-5.868-2.333	c-1.542-1.45-3.345-4.026-4.732-6.341l-4.126-6.879c-2.07-3.452-3.969-6.027-5.068-7.192c-1.182-1.254-2.642-2.754-5.067-2.754	c-1.963,0-3.689,1.362-5.084,3.465L4.918,15.456z"
		></path>
		<path
			fill="#0064e1"
			d="M14.25,14.5	c-1.959,0-3.683,1.362-5.075,3.465C7.206,20.937,6,25.363,6,29.614c0,1.753-0.003,3.072,0.5,3.886l-3.84,2.813	C1.574,34.507,1,32.2,1,29.5c0-4.91,1.355-10.091,3.918-14.044C7.192,11.951,10.507,9.5,14.27,9.5L14.25,14.5z"
		></path>
	</svg>
);

export const DeepseekIcon = ({ className = "h-6 w-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 48 48"
		className={className}
	>
		<path
			fill="#536dfe"
			d="M47.496,10.074c-0.508-0.249-0.727,0.226-1.025,0.467c-0.102,0.078-0.188,0.179-0.274,0.272	c-0.743,0.794-1.611,1.315-2.746,1.253c-1.658-0.093-3.074,0.428-4.326,1.696c-0.266-1.564-1.15-2.498-2.495-3.097	c-0.704-0.311-1.416-0.623-1.909-1.3c-0.344-0.482-0.438-1.019-0.61-1.548c-0.11-0.319-0.219-0.646-0.587-0.7	c-0.399-0.062-0.555,0.272-0.712,0.553c-0.626,1.144-0.868,2.405-0.845,3.681c0.055,2.871,1.267,5.159,3.676,6.785	c0.274,0.187,0.344,0.373,0.258,0.646c-0.164,0.56-0.36,1.105-0.532,1.665c-0.11,0.358-0.274,0.436-0.657,0.28	c-1.322-0.552-2.464-1.369-3.473-2.358c-1.713-1.657-3.262-3.486-5.194-4.918c-0.454-0.335-0.907-0.646-1.377-0.942	c-1.971-1.914,0.258-3.486,0.774-3.673c0.54-0.195,0.188-0.864-1.557-0.856c-1.744,0.008-3.34,0.591-5.374,1.369	c-0.297,0.117-0.61,0.202-0.931,0.272c-1.846-0.35-3.763-0.428-5.765-0.202c-3.77,0.42-6.782,2.202-8.996,5.245	c-2.66,3.657-3.285,7.812-2.519,12.147c0.806,4.568,3.137,8.349,6.719,11.306c3.716,3.066,7.994,4.568,12.876,4.28	c2.965-0.171,6.266-0.568,9.989-3.719c0.939,0.467,1.924,0.654,3.559,0.794c1.259,0.117,2.472-0.062,3.411-0.257	c1.471-0.311,1.369-1.673,0.837-1.922C34,36,33.471,35.441,33.471,35.441c2.19-2.591,5.491-5.284,6.782-14.007	c0.102-0.692,0.016-1.128,0-1.689c-0.008-0.342,0.07-0.475,0.462-0.514c1.079-0.125,2.128-0.42,3.09-0.949	c2.793-1.525,3.919-4.031,4.185-7.034C48.028,10.79,47.981,10.315,47.496,10.074z M23.161,37.107	c-4.177-3.284-6.203-4.365-7.04-4.319c-0.782,0.047-0.641,0.942-0.469,1.525c0.18,0.576,0.415,0.973,0.743,1.478	c0.227,0.335,0.383,0.833-0.227,1.206c-1.345,0.833-3.684-0.28-3.794-0.335c-2.722-1.603-4.998-3.72-6.602-6.614	c-1.549-2.786-2.448-5.774-2.597-8.964c-0.039-0.77,0.188-1.043,0.954-1.183c1.009-0.187,2.049-0.226,3.059-0.078	c4.263,0.623,7.893,2.529,10.936,5.548c1.737,1.72,3.051,3.774,4.404,5.782c1.439,2.132,2.988,4.163,4.959,5.828	c0.696,0.584,1.252,1.027,1.783,1.354C27.667,38.515,24.991,38.554,23.161,37.107L23.161,37.107z M25.164,24.228	c0-0.342,0.274-0.615,0.618-0.615c0.078,0,0.149,0.015,0.211,0.039c0.086,0.031,0.164,0.078,0.227,0.148	c0.11,0.109,0.172,0.265,0.172,0.428c0,0.342-0.274,0.615-0.618,0.615S25.164,24.571,25.164,24.228L25.164,24.228z M31.382,27.419	c-0.399,0.163-0.798,0.303-1.181,0.319c-0.595,0.031-1.244-0.21-1.596-0.506c-0.548-0.459-0.939-0.716-1.103-1.517	c-0.07-0.342-0.031-0.872,0.031-1.175c0.141-0.654-0.016-1.074-0.477-1.455c-0.376-0.311-0.853-0.397-1.377-0.397	c-0.196,0-0.375-0.086-0.508-0.156c-0.219-0.109-0.399-0.381-0.227-0.716c0.055-0.109,0.321-0.373,0.383-0.42	c0.712-0.405,1.533-0.272,2.292,0.031c0.704,0.288,1.236,0.817,2.003,1.564c0.782,0.903,0.923,1.152,1.369,1.829	c0.352,0.529,0.673,1.074,0.892,1.696C32.016,26.905,31.844,27.224,31.382,27.419L31.382,27.419z"
		></path>
	</svg>
);

// For Qwen - using Image component since we have a URL
export const QwenIcon = ({ className = "h-6 w-6" }) => (
	<div className={className + " relative"}>
		<Image
			src="https://chat.webllm.ai/qwen.webp"
			alt="Qwen"
			fill
			className="object-contain"
		/>
	</div>
);

export const GemmaIcon = ({ className = "h-6 w-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 48 48"
		className={className}
	>
		<path
			fill="#fbc02d"
			d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
		></path>
		<path
			fill="#e53935"
			d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
		></path>
		<path
			fill="#4caf50"
			d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
		></path>
		<path
			fill="#1565c0"
			d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
		></path>
	</svg>
);

export const PhiIcon = ({ className = "h-6 w-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 48 48"
		className={className}
	>
		<path
			fill="#ff5722"
			d="M6 6H22V22H6z"
			transform="rotate(-180 14 14)"
		></path>
		<path
			fill="#4caf50"
			d="M26 6H42V22H26z"
			transform="rotate(-180 34 14)"
		></path>
		<path
			fill="#ffc107"
			d="M26 26H42V42H26z"
			transform="rotate(-180 34 34)"
		></path>
		<path
			fill="#03a9f4"
			d="M6 26H22V42H6z"
			transform="rotate(-180 14 34)"
		></path>
	</svg>
);

export const MistralIcon = ({ className = "h-6 w-6" }) => (
	<svg
		viewBox="0 0 256 233"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path d="M186.182 0h46.545v46.545h-46.545z"></path>
		<path fill="#f7d046" d="M209.455 0H256v46.545h-46.545z"></path>
		<path d="M0 0h46.545v46.545H0zm0 46.545h46.545V93.09H0zm0 46.546h46.545v46.545H0zm0 46.545h46.545v46.545H0zm0 46.546h46.545v46.545H0z"></path>
		<path fill="#f7d046" d="M23.273 0h46.545v46.545H23.273z"></path>
		<path
			fill="#f2a73b"
			d="M209.455 46.545H256V93.09h-46.545zm-186.182 0h46.545V93.09H23.273z"
		></path>
		<path d="M139.636 46.545h46.545V93.09h-46.545z"></path>
		<path
			fill="#f2a73b"
			d="M162.909 46.545h46.545V93.09h-46.545zm-93.091 0h46.545V93.09H69.818z"
		></path>
		<path
			fill="#ee792f"
			d="M116.364 93.091h46.545v46.545h-46.545zm46.545 0h46.545v46.545h-46.545zm-93.091 0h46.545v46.545H69.818z"
		></path>
		<path d="M93.091 139.636h46.545v46.545H93.091z"></path>
		<path fill="#eb5829" d="M116.364 139.636h46.545v46.545h-46.545z"></path>
		<path
			fill="#ee792f"
			d="M209.455 93.091H256v46.545h-46.545zm-186.182 0h46.545v46.545H23.273z"
		></path>
		<path d="M186.182 139.636h46.545v46.545h-46.545z"></path>
		<path fill="#eb5829" d="M209.455 139.636H256v46.545h-46.545z"></path>
		<path d="M186.182 186.182h46.545v46.545h-46.545z"></path>
		<path fill="#eb5829" d="M23.273 139.636h46.545v46.545H23.273z"></path>
		<path
			fill="#ea3326"
			d="M209.455 186.182H256v46.545h-46.545zm-186.182 0h46.545v46.545H23.273z"
		></path>
	</svg>
);

// For Smol LM - using Image component since we have a URL
export const SmolLMIcon = ({ className = "h-6 w-6" }) => (
	<div className={className + " relative"}>
		<Image
			src="https://chat.webllm.ai/smollm.png"
			alt="Smol LM"
			fill
			className="object-contain"
		/>
	</div>
);

export const StableLMIcon = ({ className = "h-6 w-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 100 100"
		className={className}
	>
		<g strokeWidth="2" fill="none">
			<path
				stroke="#9f4fff"
				vectorEffect="non-scaling-stroke"
				d="M22.67 33.13q-.28.6-.92-.15-.07-.08 0-.16.21-.23.05-.58a.41.41 0 0 0-.38-.22q-5.78.27-11.47.46-.69.03-1.33-.25-.62-.27-1.24-.53-.41-.17-.66.19-.34.47-1.25.61"
			></path>
			<path
				stroke="#a169ff"
				vectorEffect="non-scaling-stroke"
				d="m59.23 66.23-1.53-1.9q-.63-.78-.53.26.04.45-.19.84-.28.47-.81.46l-14.04-.27"
			></path>
		</g>
		<path
			fill="#9e41ff"
			d="M22.67 33.13q-.28.6-.92-.15-.07-.08 0-.16.21-.23.05-.58a.41.41 0 0 0-.38-.22q-5.78.27-11.47.46-.69.03-1.33-.25-.62-.27-1.24-.53-.41-.17-.66.19-.34.47-1.25.61c.86-9.12 8.17-15.7 16.74-17.87q16.11-4.1 31.77 3.57a1.7 1.69-77.3 0 1 .96 1.53l.04 14.01q0 .78-.65.35c-6.78-4.51-14.68-6.47-23.05-6.02q-6.34.34-8.61 5.06Z"
		></path>
		<path
			fill="#a05cff"
			d="M22.67 33.13c-.87 4.3 2.29 6.8 5.93 7.99 13.07 4.29 31.97 6.12 30.63 25.11l-1.53-1.9q-.63-.78-.53.26.04.45-.19.84-.28.47-.81.46l-14.04-.27q.17-3.49-2.81-5.45-2.72-1.79-6.95-3.04c-12.13-3.6-29.44-7.46-26.9-24.63q.91-.14 1.25-.61.25-.36.66-.19.62.26 1.24.53.64.28 1.33.25 5.69-.19 11.47-.46a.41.41 0 0 1 .38.22q.16.35-.05.58-.07.08 0 .16.64.75.92.15Z"
		></path>
		<path
			fill="#a276ff"
			d="m42.13 65.62 14.04.27q.53.01.81-.46.23-.39.19-.84-.1-1.04.53-.26l1.53 1.9c-.74 24.95-38.97 25.11-53.35 14.02q-.39-.3-.39-.79l.01-15.65q0-.89.63-.26c7.35 7.32 19.26 10.04 28.86 8.44q5.66-.94 7.14-6.37Z"
		></path>
		<circle fill="#e80000" cx="83.99" cy="75.82" r="10.45"></circle>
	</svg>
);

export const RedPajamaIcon = ({ className = "h-6 w-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
	</svg>
);

export const WizardMathIcon = ({ className = "h-6 w-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path>
		<path d="m14 7 3 3"></path>
		<path d="M5 6v4"></path>
		<path d="M19 14v4"></path>
		<path d="M10 2v2"></path>
		<path d="M7 8H3"></path>
		<path d="M21 16h-4"></path>
		<path d="M11 3H9"></path>
	</svg>
);

export const DefaultIcon = ({ className = "h-6 w-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<rect width="18" height="18" x="3" y="3" rx="2" />
		<path d="M12 8v8" />
		<path d="M8 12h8" />
	</svg>
);

export const SnowflakeIcon = ({ className = "h-6 w-6" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 48 48"
		className={className}
	>
		<line
			x1="24"
			x2="24"
			y1="41.321"
			y2="6.679"
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
		></line>
		<line
			x1="33"
			x2="30"
			y1="24"
			y2="24"
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
		></line>
		<line
			x1="18"
			x2="15"
			y1="24"
			y2="24"
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
		></line>
		<line
			x1="28.5"
			x2="27"
			y1="16.206"
			y2="18.804"
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
		></line>
		<line
			x1="21"
			x2="19.5"
			y1="29.196"
			y2="31.794"
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
		></line>
		<line
			x1="19.5"
			x2="21"
			y1="16.206"
			y2="18.804"
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
		></line>
		<line
			x1="27"
			x2="28.5"
			y1="29.196"
			y2="31.794"
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
		></line>
		<line
			x1="39"
			x2="9"
			y1="15.34"
			y2="32.66"
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
		></line>
		<line
			x1="9"
			x2="39"
			y1="15.34"
			y2="32.66"
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
		></line>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="26,8 24,10 22,8"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="28,11 24,15 20,11"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="22,40 24,38 26,40"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="20,37 24,33 28,37"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="9.144,30.268 11.876,31 11.144,33.732"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="10.742,27.036 16.206,28.5 14.742,33.964"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="38.856,17.732 36.124,17 36.856,14.268"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="37.258,20.964 31.794,19.5 33.258,14.036"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="36.856,33.732 36.124,31 38.856,30.268"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="33.258,33.964 31.794,28.5 37.258,27.036"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="11.144,14.268 11.876,17 9.144,17.732"
		></polyline>
		<polyline
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="14.742,14.036 16.206,19.5 10.742,20.964"
		></polyline>
		<polygon
			fill="none"
			stroke="#29a5ff"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-miterlimit="10"
			stroke-width="2"
			points="18,27.464 24,30.928 30,27.464 30,20.536 24,17.072 18,20.536"
		></polygon>
	</svg>
);

// Component that selects the right icon based on name
export const ModelIcon = ({ company, className = "h-6 w-6" }) => {
	switch (company) {
		case "Llama":
			return <LlamaIcon className={className} />;
		case "DeepSeek":
			return <DeepseekIcon className={className} />;
		case "Qwen":
			return <QwenIcon className={className} />;
		case "Gemma":
			return <GemmaIcon className={className} />;
		case "Phi":
			return <PhiIcon className={className} />;
		case "Mistral":
			return <MistralIcon className={className} />;
		case "SmolLM":
			return <SmolLMIcon className={className} />;
		case "StableLM":
			return <StableLMIcon className={className} />;
		case "RedPajama":
			return <RedPajamaIcon className={className} />;
		case "WizardMath":
			return <WizardMathIcon className={className} />;
		case "Snowflake":
			return <SnowflakeIcon className={className} />;
		default:
			return <DefaultIcon className={className} />;
	}
};
