import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  console.log("GET /api/keys/validate");
  
  // Extract the API key from query parameters
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("key");

  // Check if key parameter is provided
  if (!apiKey) {
    return NextResponse.json(
      {
        valid: false,
        error: "API key parameter is required",
      },
      { status: 400 }
    );
  }

  // Validation 1: Check proper length (minimum 10 characters)
  if (apiKey.length < 10) {
    return NextResponse.json({
      valid: false,
      error: "API key must be at least 10 characters long",
    });
  }

  // Validation 2: Check if it starts with 'stan'
  if (!apiKey.startsWith("stan")) {
    return NextResponse.json({
      valid: false,
      error: "API key must start with 'stan'",
    });
  }

  // Validation 3: Check if key exists in the database
  try {
    const result = await pool.query(
      "SELECT id, name, usage_count FROM public.user_keys WHERE key_value = $1",
      [apiKey]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        valid: false,
        error: "API key not found in database",
      });
    }

    // All validations passed
    const keyData = result.rows[0];
    
    // Optionally increment usage count
    await pool.query(
      "UPDATE public.user_keys SET usage_count = usage_count + 1 WHERE key_value = $1",
      [apiKey]
    );

    return NextResponse.json({
      valid: true,
      message: "API key is valid",
      data: {
        id: keyData.id,
        name: keyData.name,
        usageCount: keyData.usage_count + 1,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Database error occurred",
      },
      { status: 500 }
    );
  }
}

