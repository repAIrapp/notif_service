const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: ["node_modules/", "coverage/", "dist/", "build/"],
  },

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,   
        ...globals.jest,   
      },
    },
    rules: {
      // Règles recommandées de @eslint/js
      ...js.configs.recommended.rules,
      "no-console": "off", 
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
