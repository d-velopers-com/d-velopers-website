import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "import/order": [
        "error",
        {
          alphabetize: { caseInsensitive: true, order: "asc" },
          groups: [
            "type",
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],
      "no-console": ["error", { allow: ["error", "warn"] }],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: [
      "app/dashboard/dashboard-client.tsx",
      "app/home-client.tsx",
      "app/jobs/jobs-client.tsx",
      "app/jobs/manage/manage-client.tsx",
      "components/language-switcher.tsx",
      "components/theme-switch.tsx",
      "contexts/language-context.tsx",
      "hooks/useLinkPreview.ts",
    ],
    rules: {
      // These components intentionally mirror URL, browser, or remote-resource state.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["app/jobs/manage/manage-client.tsx"],
    rules: {
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
  {
    files: [
      "app/jobs/manage/manage-client.tsx",
      "**/profile-client.tsx",
      "components/LinkPreviewCard.tsx",
      "components/navbar.tsx",
    ],
    rules: {
      // Some images come from user-controlled remote origins that cannot be
      // safely enumerated in Next's image allowlist.
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: [
      "app/dashboard/dashboard-client.tsx",
      "app/login/page.tsx",
      "hooks/useSession.ts",
    ],
    rules: {
      // OAuth and logout endpoints require a full document navigation.
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "coverage/**",
    "node_modules/**",
    "public/**",
    "scripts/**",
    "tailwind.config.js",
  ]),
]);
