/**
 * reCAPTCHA configuration
 * Set VITE_RECAPTCHA_SITE_KEY to a production v2 site key from:
 * https://www.google.com/recaptcha/admin
 *
 * No test-key fallback: Google's test key always validates, which would make
 * spam protection non-functional in production.
 */
const GOOGLE_TEST_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

const configured = (import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "").trim();

export const RECAPTCHA_SITE_KEY =
  configured && configured !== GOOGLE_TEST_SITE_KEY ? configured : "";

export const RECAPTCHA_ENABLED = RECAPTCHA_SITE_KEY.length > 0;
