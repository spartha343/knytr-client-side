/**
 * Environment Configuration
 *
 * This module handles environment variables with proper validation.
 * It ensures required variables are set before the app starts.
 */

/**
 * Get the API base URL from environment variables.
 *
 * @throws {Error} If NEXT_PUBLIC_API_BASE_URL is not defined
 * @returns {string} The API base URL
 */
export const getBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // In development, provide a helpful default
  if (!baseUrl) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ NEXT_PUBLIC_API_BASE_URL is not set. Using default: http://localhost:5000/api/v1",
      );
      return "http://localhost:5000/api/v1";
    }

    // In production, fail fast with a clear error
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL environment variable is not defined. " +
        "Please set it in your .env.local file.",
    );
  }

  return baseUrl;
};

/**
 * Validate all required environment variables at app startup.
 * Call this in your root layout or _app file.
 */
export const validateEnv = () => {
  const requiredVars = [
    "NEXT_PUBLIC_API_BASE_URL",
    "NEXT_PUBLIC_FIREBASE_apiKey",
    "NEXT_PUBLIC_FIREBASE_authDomain",
    "NEXT_PUBLIC_FIREBASE_projectId",
    "NEXT_PUBLIC_FIREBASE_storageBucket",
    "NEXT_PUBLIC_FIREBASE_messagingSenderId",
    "NEXT_PUBLIC_FIREBASE_appId",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missingVars.join(", "),
    );

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }
  }
};
