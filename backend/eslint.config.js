import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";
import noEmptyLinesInExpressions from "./eslint-rules/no-empty-lines-in-expressions.js";

export default defineConfig([
	globalIgnores(["dist", "node_modules"]),
	js.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier,
	eslintPluginPrettier,
	{
		files: ["**/*.ts"],
		languageOptions: {
			globals: globals.node,
		},
	},
	{
		plugins: {
			local: {
				rules: {
					"no-empty-lines-in-expressions": noEmptyLinesInExpressions,
				},
			},
		},
		rules: {
			"local/no-empty-lines-in-expressions": "error",
		},
	},
]);
