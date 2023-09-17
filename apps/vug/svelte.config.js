import vercel from "@sveltejs/adapter-vercel";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	kit: {
		adapter: vercel({
			// make explicit -- vercel does not yet support later node versions
			runtime: "nodejs18.x",
		}),
		alias: {
			$atoms: "./src/lib/components/atoms",
			$assets: "./src/lib/assets",
			$components: "./src/lib/components",
			$data: "./src/lib/data",
			$functions: "./src/lib/functions",
			$molecules: "./src/lib/components/molecules",
			$organisms: "./src/lib/components/organisms",
			$settings: "./src/lib/settings",
			$stores: "./src/lib/stores",
			$types: "./src/lib/types",
			$utils: "./src/lib/utils",
		}
	},
};

export default config;
