import vercel from "@sveltejs/adapter-vercel";
//import adapter from "@sveltejs/adapter-auto";
//import staticAdapter from "@sveltejs/adapter-static";

import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	compilerOptions: { preserveComments: true },
	kit: {
		adapter: vercel(),
		csp: {
			directives: {
				// "script-src": ["self", "ljcdn.nyc3.cdn.digitaloceanspaces.com"],
			},
		},
		alias: {
			$atoms: "./src/lib/components/atoms",
			$functions: "./src/lib/functions",
			$molecules: "./src/lib/components/molecules",
			$organisms: "./src/lib/components/organisms",
			$templates: "./src/lib/components/templates",
			$pages: "./src/lib/components/pages",
			$routes: "./src/routes",
			$stores: "./src/lib/stores",
			$tools: "./src/lib/components/tools",
			$utils: "./src/lib/utils",
		},
		inlineStyleThreshold: 60000,
		//version: { name: JSON.stringify(new Date()) },
	},
};

export default config;
