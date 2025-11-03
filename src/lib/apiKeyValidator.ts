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
 * 4. Ownership (if userId provided, key must belong to that user)
 * 
 * @param apiKey - The API key to validate
 * @param userId - Optional user ID to verify ownership
 * @returns ValidationResult with valid flag and optional error message or key data
 */
export async function validateApiKey(
  apiKey: string,
  userId?: string
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
      "SELECT id, name, usage_count, user_id FROM public.user_keys WHERE key_value = $1 AND user_id = $2",
      [apiKey, userId]
    );

    if (result.rows.length === 0) {
      return {
        valid: false,
        error: "API key not found in database",
      };
    }

    const keyData = result.rows[0];

    // Validation 5: Check if key is active (usage_count < 10)
    if (keyData.usage_count >= 10) {
      return {
        valid: false,
        error: "API key is not active - maximum usage limit reached",
        keyData,
      };
    }

    // All validations passed
    return {
      valid: true,
      keyData,
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
 * Validates API key format (length and prefix) without checking database
 * Used when creating new API keys
 * 
 * @param apiKey - The API key to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateApiKeyFormat(apiKey: string): { valid: boolean; error?: string } {
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

  return { valid: true };
}

/**
 * Checks if an API key already exists in the database
 * 
 * @param apiKey - The API key to check
 * @returns true if key exists, false otherwise
 */
export async function apiKeyExists(apiKey: string): Promise<boolean> {
  try {
    const result = await pool.query(
      "SELECT id FROM public.user_keys WHERE key_value = $1",
      [apiKey]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("Database error checking API key existence:", error);
    return false;
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

