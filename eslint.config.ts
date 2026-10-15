import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import markdownlint from "eslint-plugin-markdownlint";
import markdownlintParser from "eslint-plugin-markdownlint/parser";
import { configs as sonarjs } from "eslint-plugin-sonarjs";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const tsfiles = ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,astro}"];

export default defineConfig([
  // Ignore folders globally
  globalIgnores([
    "node_modules/**",
    ".astro/**",
    ".agents/skills/**",
    "build/**",
    "dist/**",
    "test-results/**",
    "playwright-report/**",
  ]),

  sonarjs.recommended,

  // TypeScript
  {
    files: tsfiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
  },
  {
    files: tsfiles,
    rules: {
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/consistent-type-exports": "error",

      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/promise-function-async": "error",

      "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        {
          ignorePrimitives: {
            // ignores null or undefined unions with boolean
            boolean: true,
          },
        },
      ],
    },
  },
  {
    files: tsfiles,
    // This check will cause linter halt.
    // Maybe related to https://github.com/typescript-eslint/typescript-eslint/pull/11605
    rules: {
      "@typescript-eslint/no-deprecated": "off",
    },
  },
  {
    files: tsfiles,
    // https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import
    rules: {
      "import/named": "off",
      "import/namespace": "off",
      "import/default": "off",
      "import/no-named-as-default-member": "off",
    },
  },
  {
    files: tsfiles,
    rules: {
      // Duplicate of @typescript-eslint/no-unused-vars
      "sonarjs/no-unused-vars": "off",
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",

          args: "all",
          argsIgnorePattern: "^_",

          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",

          destructuredArrayIgnorePattern: "^_",

          reportUsedIgnorePattern: true,
        },
      ],
    },
  },
  {
    files: tsfiles,
    rules: {
      eqeqeq: ["error", "always"],
      "func-style": ["error", "declaration"],
    },
  },

  // Astro
  eslintPluginAstro.configs.recommended,
  eslintPluginAstro.configs["jsx-a11y-strict"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: true,
      },
    },
  },

  // CSS
  eslintPluginBetterTailwindcss.configs["correctness-error"],
  eslintPluginBetterTailwindcss.configs["stylistic-error"],
  {
    rules: {
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "./src/styles/global.css",
        detectComponentClasses: true,
      },
    },
  },

  // Markdown
  {
    files: ["**/*.md"],
    plugins: { markdownlint },
    languageOptions: { parser: markdownlintParser },
    rules: {
      ...markdownlint.configs.recommended.rules,
    },
  },

  //
  eslintConfigPrettier,
  {
    files: tsfiles,
    // These configs are disabled by eslint-config-prettier, but we want to enable them.
    rules: {
      // https://github.com/prettier/eslint-config-prettier#curly
      curly: ["error", "all"],
      // https://github.com/prettier/eslint-config-prettier#arrow-body-style-and-prefer-arrow-callback
      "prefer-arrow-callback": "error",
    },
  },
]);
