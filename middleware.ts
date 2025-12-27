// middleware.ts
/**
 * next-intl middleware
 * --------------------
 * Enables locale-based routing for 4 languages:
 * - en, ro, de, ru
 *
 * This is required so `useTranslations()` works correctly in the App Router.
 *
 * Assumptions:
 * - Your app will use locale-prefixed routes: /en, /ro, /de, /ru
 * - We keep defaultLocale as "en"
 */

import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "ro", "de", "ru"],
  defaultLocale: "en",
  localePrefix: "always",
});

export const config = {
  // Match all routes except Next internals and static files
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
