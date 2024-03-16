module.exports = {
  extends: [
    "xo",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "prettier",
  ],

  plugins: ["import"],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },

  globals: {
    window: true,
    document: true,
  },

  rules: {
    "capitalized-comments": "off",
    camelcase: "off",
    "default-param-last": "off",
    complexity: ["error", { max: 41 }],
    "no-unused-vars": "off",
    "object-shorthand": "off",
    "no-bitwise": "off",
    "prefer-exponentiation-operator": "off",
    "no-control-regex": "off",
    "arrow-body-style": "off",
    "no-constructor-return": "off",
  },
  overrides: [
    {
      files: ["*.test.*", "**/types/**/test.ts"],

      globals: {
        xit: true,
        it: true,
        describe: true,
        before: true,
        after: true,
        test: true,
      },
      rules: {
        "import/no-extraneous-dependencies": "off",
        "import/namespace": "off",
        "no-import-assign": "off",
        "no-unused-expressions": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "require-atomic-updates": "off",
        "max-nested-callbacks": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "jsdoc/require-jsdoc": "off",
      },
    },
    {
      files: ["**/*.d.ts"],
      rules: {
        "import/no-unresolved": "off",
        "no-redeclare": "off",
      },
    },
  ],
};
