/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ["chat.webllm.ai"],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

module.exports = nextConfig;
