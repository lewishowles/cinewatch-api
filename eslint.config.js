import globals from "globals";
import pluginJs from "@eslint/js";
import stylistic from "./config/eslint/stylistic.js";

export default [
	{
		files: ["**/*.js"],
	},
	{
		languageOptions: {
			globals: globals.node,
		},
	},
	pluginJs.configs.recommended,
	stylistic,
];
