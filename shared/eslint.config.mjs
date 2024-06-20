import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...fixupConfigRules(compat.extends(
    "../.eslintrc",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
)), {
    plugins: {
        "react-hooks": fixupPluginRules(reactHooks),
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