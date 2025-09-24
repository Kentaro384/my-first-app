// eslint.config.js  （CommonJS 版）
/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
    // 無視パターン（旧 .eslintignore の置き換え）
    {
      ignores: ["node_modules/**", "dist/**", "build/**"],
    },
    // JS ファイルに対するルール
    {
      files: ["**/*.js"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: { window: "readonly", document: "readonly" },
      },
      rules: {
        semi: ["error", "always"],
        quotes: ["error", "double"],
        // 必要に応じてルールを足していけます
        // "no-unused-vars": "error",
      },
    },
  ];