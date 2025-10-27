import { NextResponse } from "next/server";
import { validateApiKey, incrementApiKeyUsage } from "@/lib/apiKeyValidator";

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

  // Validate the API key using the common validator
  const validationResult = await validateApiKey(apiKey);

  if (!validationResult.valid) {
    return NextResponse.json({
      valid: false,
      error: validationResult.error,
    });
  }

  // All validations passed
  const keyData = validationResult.keyData!;
  
  // Increment usage count
  await incrementApiKeyUsage(apiKey);

  return NextResponse.json({
    valid: true,
    message: "API key is valid",
    data: {
      id: keyData.id,
      name: keyData.name,
      usageCount: keyData.usage_count + 1,
    },
  });
}

