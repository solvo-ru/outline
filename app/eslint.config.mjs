import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";

import globals from "globals";


export default [
    "../eslint.config.js",
    react.configs.recommended,
    reactHooks.configs.recommended,
    {
    plugins: {
        reactHooks: reactHooks,
    },

    languageOptions: {
        globals: {
            ...globals.jest,
            ...globals.browser,
        },
    },
}];