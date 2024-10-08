import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import es from "eslint-plugin-es";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import node from "eslint-plugin-node";
import react from "eslint-plugin-react";
import lodash from "eslint-plugin-lodash";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["server/migrations/*.js"],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript",
     // "plugin:prettier/recommended"
    )
  ),
  {
    plugins: {
      es: fixupPluginRules(es),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
      node,
      react: fixupPluginRules(react),
      lodash,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "module",

      parserOptions: {
        extraFileExtensions: [".json"],
        project: "./tsconfig.json",

        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        createClass: "createReactClass",
        pragma: "React",
        version: "detect",
      },

      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },

      "import/resolver": {
        typescript: {},
      },
    },

    rules: {
      eqeqeq: 2,
      curly: 2,
      "no-console": "error",
      "arrow-body-style": ["error", "as-needed"],
      "spaced-comment": "error",
      "object-shorthand": "error",
      "no-mixed-operators": "off",
      "no-useless-escape": "off",
      "no-shadow": "off",
      "es/no-regexp-lookbehind-assertions": "error",

      "react/self-closing-comp": [
        "error",
        {
          component: true,
          html: true,
        },
      ],

      "@typescript-eslint/no-shadow": [
        "warn",
        {
          hoist: "all",
          ignoreTypeValueShadow: true,
        },
      ],

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],

      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "*",
          next: "export",
        },
      ],

      "lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: true,
        },
      ],

      "lodash/import-scope": ["warn", "method"],
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      "import/newline-after-import": 2,

      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
          },

          pathGroups: [
            {
              pattern: "@shared/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@server/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/stores",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/stores/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/models/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/scenes/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/components/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/**",
              group: "external",
              position: "after",
            },
          ],
        },
      ],
/*
      "prettier/prettier": [
        "error",
        {
          printWidth: 80,
          trailingComma: "es5",
        },
      ], */
    },
  },
];
