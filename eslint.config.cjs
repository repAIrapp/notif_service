// eslint.config.cjs (Flat config ESLint v9, CommonJS)
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  // Fichiers ignorés (remplace .eslintignore)
  {
    ignores: ["node_modules/", "coverage/", "dist/", "build/"],
  },

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,   // ex: require, module, __dirname
        ...globals.jest,   // ex: describe, it, expect (pour les tests)
      },
    },
    rules: {
      // Règles recommandées de @eslint/js
      ...js.configs.recommended.rules,

      // Ajuste selon tes besoins:
      "no-console": "off", // laisse les console.* pour ce service
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
