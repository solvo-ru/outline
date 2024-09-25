import es from "eslint-plugin-es-x";
import tseslint from "typescript-eslint";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import-x";
import node from "eslint-plugin-node";
import react from "eslint-plugin-react";
import lodash from "eslint-plugin-lodash";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["server/migrations/*.js"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  _import.flatConfigs.recommended,

  _import.flatConfigs.typescript,
  prettier,
  {
    plugins: {
      es: es,
      tseslint: tseslint,
      typescriptEslint: typescriptEslint,
      import: _import,
      node: node,
      react: react,
      lodash: lodash,
      prettier: prettierPlugin
    },

    languageOptions: {

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "commonjs",
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
      // "spaced-comment": "error",
      "object-shorthand": "error",
      // "no-mixed-operators": "off",
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


      // "@typescript-eslint": [
      //   "warn",
      //   {
      //     hoist: "all",
      //     ignoreTypeValueShadow: true,
      //   },
      // ],

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

/*      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "*",
          next: "export",
        },
      ],*/

     /* "lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: true,
        },
      ],*/

      "lodash/import-scope": ["warn", "method"],
      "import-x/no-named-as-default": "off",
      "import-x/no-named-as-default-member": "off",
      "import-x/newline-after-import": 2,

      'import-x/order': [
        "error",
        {
          alphabetize: {
            order: "asc",
          },

          pathGroups: [
            {
              pattern: "@shared/!**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@server/!**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/stores",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/stores/!**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/models/!**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/scenes/!**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/components/!**",
              group: "external",
              position: "after",
            },
            {
              pattern: "~/!**",
              group: "external",
              position: "after",
            },
          ],
        },
      ],

      'prettier/prettier': [
        "error",
        {
          printWidth: 80,
          trailingComma: "es5",
        },
      ],
    },
  },
];
