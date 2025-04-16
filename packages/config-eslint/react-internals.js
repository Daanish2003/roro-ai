import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config} 
 */
export const config = [
  // Base config shared across other rules
  ...baseConfig,

  // Recommended JavaScript rules
  js.configs.recommended,

  // Prettier's formatting rules
  eslintConfigPrettier,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // React plugin configuration with JSX transform (no React in scope)
  pluginReact.configs.flat.recommended,

  // React Hooks plugin for enforcing hooks rules
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      // React Hooks recommended rules
      ...pluginReactHooks.configs.recommended.rules,
      // React 17 JSX transform no longer needs React in scope
      "react/react-in-jsx-scope": "off",
      // Prop-types are not required in TypeScript/modern React
      "react/prop-types": "off",
    },
  },

  // Allow for serviceworker and browser globals
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
];
