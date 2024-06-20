import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("../.eslintrc"), {
    languageOptions: {
        globals: {
            ...globals.jest,
            ...globals.node,
        },

        ecmaVersion: 5,
        sourceType: "commonjs",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    rules: {
        "@typescript-eslint/no-misused-promises": ["error", {
            checksVoidReturn: true,
        }],

        "no-restricted-imports": ["error", {
            name: "fetch-with-proxy",
            message: "Use `@server/utils/fetch` instead",
        }, {
            name: "node-fetch",
            message: "Use `@server/utils/fetch` instead",
        }, {
            name: "passport",
            message: "Use the `@outlinewiki/koa-passport` package",
        }],
    },
}, {
    files: ["scripts/*"],

    rules: {
        "no-console": "off",
    },
}];