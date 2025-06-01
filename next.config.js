/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ["chat.webllm.ai"],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		// This will completely ignore ESLint errors during build
		ignoreDuringBuilds: true,

		// Alternatively, if you only want to ignore certain rules, create an .eslintrc.json file
		// with specific rule configurations
	},
};

module.exports = nextConfig;
