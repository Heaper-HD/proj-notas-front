/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Sem rotas de API ou server actions no Next - sempre exportamos
	// HTML/JS estático (deploy: Cloudflare Pages)
	output: "export",
};

module.exports = nextConfig;
