import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import react from "eslint-plugin-react";
import root from "../eslint.config.mjs";

export default [
    root,
    react.configs.recommended,
    reactHooks.configs.recommended,
    {
    plugins: {
        "react-hooks": reactHooks,
    },

    languageOptions: {
        globals: {
            ...globals.jest,
            ...globals.browser,
        },
    },

    rules: {
        "@typescript-eslint/no-restricted-imports": ["error", {
            patterns: [{
                group: ["@shared/*"],
                message: "Use relative imports.",
            }, {
                allowTypeImports: true,
                group: ["~/*"],
                message: "Do not reference app code from shared code.",
            }, {
                allowTypeImports: true,
                group: ["@server/*"],
                message: "Do not reference server code from shared code.",
            }],
        }],
    },
}];