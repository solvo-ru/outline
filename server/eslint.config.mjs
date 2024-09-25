import root from "../eslint.config.mjs";
import globals from "globals";

export default [
    root,
    {
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