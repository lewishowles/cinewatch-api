import globals from "globals";
import pluginJs from "@eslint/js";
import stylistic from "./config/eslint/stylistic.js";

export default [
	{
		files: ["**/*.js"],
	},
	{
		languageOptions: {
			globals: {
				...globals.node,
				document: true,
				window: true,
				Node: true,
			},
		},
	},
	pluginJs.configs.recommended,
	stylistic,
];
