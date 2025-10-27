import pool from "@/lib/db";

export interface ApiKeyValidationResult {
  valid: boolean;
  error?: string;
  keyData?: {
    id: string;
    name: string;
    usage_count: number;
  };
}

/**
 * Validates an API key against multiple criteria:
 * 1. Length (minimum 10 characters)
 * 2. Prefix (must start with 'stan')
 * 3. Existence in database
 * 
 * @param apiKey - The API key to validate
 * @returns ValidationResult with valid flag and optional error message or key data
 */
export async function validateApiKey(
  apiKey: string
): Promise<ApiKeyValidationResult> {
  // Validation 1: Check proper length (minimum 10 characters)
  if (apiKey.length < 10) {
    return {
      valid: false,
      error: "API key must be at least 10 characters long",
    };
  }

  // Validation 2: Check if it starts with 'stan'
  if (!apiKey.startsWith("stan")) {
    return {
      valid: false,
      error: "API key must start with 'stan'",
    };
  }

  // Validation 3: Check if key exists in the database
  try {
    const result = await pool.query(
      "SELECT id, name, usage_count FROM public.user_keys WHERE key_value = $1",
      [apiKey]
    );

    if (result.rows.length === 0) {
      return {
        valid: false,
        error: "API key not found in database",
      };
    }

    // All validations passed
    return {
      valid: true,
      keyData: result.rows[0],
    };
  } catch (error) {
    console.error("Database error during API key validation:", error);
    return {
      valid: false,
      error: "Database error occurred",
    };
  }
}

/**
 * Increments the usage count for a given API key
 * 
 * @param apiKey - The API key to increment usage for
 */
export async function incrementApiKeyUsage(apiKey: string): Promise<void> {
  await pool.query(
    "UPDATE public.user_keys SET usage_count = usage_count + 1 WHERE key_value = $1",
    [apiKey]
  );
}

