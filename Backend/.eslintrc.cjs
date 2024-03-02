module.exports = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended-type-checked"],
    plugins: ["@typescript-eslint"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
    },
    root: true,
    overrides: [
        {
            extends: ["plugin:@typescript-eslint/disable-type-checked"],
            files: ["./**/*.cjs"],
        },
    ],
};
