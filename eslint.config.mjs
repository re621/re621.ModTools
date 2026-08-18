import { defineConfig } from '@eslint/config-helpers';
import eslint from '@eslint/js/src/index.js';
// import tseslint from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

const base/* : import('@eslint/config-helpers').ConfigWithExtends */ = {
  /* extends: [
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    // tseslint.configs.stylistic,
  ], */
  languageOptions: {
    // parser: tseslint.parser,
    parserOptions: {
      projectService: "tsconfig.eslint.json",
    },
  },
  linterOptions: {
    reportUnusedDisableDirectives: "warn",
    // noInlineConfig: false,
    // reportUnusedInlineConfigs: "warn",
  },
  // plugins: { "@typescript-eslint": tseslint.plugin, },
  files: ["**/*.{ts,mjs}"],
  ignores: [
    "/bin/*.js",
    "/bin/**.js",
    "/bin/**/*.js",
    "/test/*.js",
    "/dist/",
    "webpack.config.js",
    "eslint.config.mjs",
    "UserscriptWebpackPlugin.js",
  ],
};
export default defineConfig([{
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    // tseslint.configs.stylistic,
  ],
  languageOptions: {
    // parser: tseslint.parser,
    parserOptions: {
      projectService: "tsconfig.eslint.json",
    },
  },
  linterOptions: {
    reportUnusedDisableDirectives: "warn",
    // noInlineConfig: false,
    // reportUnusedInlineConfigs: "warn",
  },
  // plugins: { "@typescript-eslint": tseslint.plugin, },
  files: ["**/*.{ts,mjs}"],
  ignores: [
    "/bin/*.js",
    "/bin/**.js",
    "/bin/**/*.js",
    "/test/*.js",
    "/dist/",
    "webpack.config.js",
    "eslint.config.mjs",
    "UserscriptWebpackPlugin.js",
  ],
  rules: {
    "@typescript-eslint/no-deprecated": "warn",
    "@typescript-eslint/prefer-promise-reject-errors": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-base-to-string": ["warn", {
      ignoredTypeNames: [
        "Error", "RegExp", "URL", "URLSearchParams", // Default
        "Date",
        "FormDataEntryValue", // Relies on the assumption that it's a string & not a file.
        "number", "boolean",
      ],
    }],
    "@typescript-eslint/restrict-template-expressions": ["warn", {
      allow: [
        { "name": [ "Error", "URL", "URLSearchParams" ], "from": "lib" },
        { "name": [ "Date" ], "from": "lib" },
      ],
    }],
    "@typescript-eslint/restrict-plus-operands": "warn",
    "@typescript-eslint/require-await": "warn",
    "@typescript-eslint/unbound-method": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-unsafe-enum-comparison": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    // "@typescript-eslint/no-unsafe-member-access": ["warn", {allowOptionalChaining: true}],
    // "@typescript-eslint/no-unsafe-argument": "warn",
    // "@typescript-eslint/no-unsafe-assignment": "warn",
    // "@typescript-eslint/no-unsafe-call": "warn",

    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-namespace": "off",

    "no-async-promise-executor": "off",
    "no-empty": "off",
    "indent": ["warn", 2, { SwitchCase: 1 }],
  }
}, /* {
  ...base,
  rules: {
    "dot-notation": "off",
    "@typescript-eslint/dot-notation": "warn",
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/adjacent-overload-signatures": "warn",
    "@typescript-eslint/array-type": "warn",
    "@typescript-eslint/ban-tslint-comment": "warn",
    "@typescript-eslint/class-literal-property-style": "warn",
    "@typescript-eslint/consistent-generic-constructors": "warn",
    "@typescript-eslint/consistent-indexed-object-style": "warn",
    "@typescript-eslint/consistent-type-assertions": "warn",
    "@typescript-eslint/consistent-type-definitions": "warn",
    "@typescript-eslint/no-confusing-non-null-assertion": "warn",
    "@typescript-eslint/no-inferrable-types": "warn",
    "@typescript-eslint/non-nullable-type-assertion-style": "warn",
    "@typescript-eslint/prefer-find": "warn",
    "@typescript-eslint/prefer-for-of": "warn",
    "@typescript-eslint/prefer-function-type": "warn",
    "@typescript-eslint/prefer-includes": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",
    "@typescript-eslint/prefer-regexp-exec": "warn",
    "@typescript-eslint/prefer-string-starts-ends-with": "warn",
  }
} */]);
