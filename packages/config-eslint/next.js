const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "prettier",
    require.resolve("@vercel/style-guide/eslint/next"),
    "plugin:import/recommended",
    "plugin:import/typescript",
    "turbo"
  ],
  plugins: ["only-warn"],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    ".*.js",
    "node_modules/",
    "dist/",
    ".next/",
  ],
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      parserOptions: {
        project,
        tsconfigRootDir: process.cwd(),
      },
    },
  ],
};
