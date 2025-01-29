const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const { join } = require("node:path");

module.exports = {
	output: {
		path: join(__dirname, "../../dist/apps/server"),
	},
	plugins: [
		new NxAppWebpackPlugin({
			target: "node",
			compiler: "tsc",
			main: "./src/main.ts",
			tsConfig: "./tsconfig.app.json",
			optimization: false,
			outputHashing: "none",
			generatePackageJson: true,
			externalDependencies: [
                "express",
				"@deepgram/sdk",
				"@huggingface/transformers",
				"@langchain/community",
				"@langchain/core",
				"@ricky0123/vad-web",
				"cors",
				"dotenv",
				"mediasoup",
				"socket.io",
				"uuid",
				"winston",
			],
		}),
	],
};
