const es = require("eslint-plugin-es");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const _import = require("eslint-plugin-import");
const node = require("eslint-plugin-node");
const react = require("eslint-plugin-react");
const lodash = require("eslint-plugin-lodash");
const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");
const prettier = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
  {
    ignores: ["server/migrations/*.js"],
  },
  js.configs.recommended,
  //typescriptEslint.configs.eslintrecommended,
  _import.configs.recommended,
  _import.configs.typescript,
  prettier,
  {
    plugins: {
      es: es,
      typescriptEslint: typescriptEslint,
      import: _import,
      node: node,
      react: react,
      lodash: lodash,
      prettier: prettierPlugin
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "script",
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
