const dockerIgnoreContent = [
  "node_modules",
  "npm-debug.log",
  ".git",
  ".idea",
  ".vscode",
  ".env",
  "dist",
].join("\n");

const tsErrorHandler = `export default class ErrorHandler extends Error {
    constructor(public statusCode: number,public message: string) {
      super(message);
      this.statusCode = statusCode;
    }
  }`;

const jsErrorHandler = ` export default class ErrorHandler extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
    }
  }`;

const eslintConfigJs = `
import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
];
`;

const eslintConfigTs = `
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/node_modules/**", "dist/**"],
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
`;

export {
  dockerIgnoreContent,
  tsErrorHandler,
  jsErrorHandler,
  eslintConfigJs,
  eslintConfigTs,
};
