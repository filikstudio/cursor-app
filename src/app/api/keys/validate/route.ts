import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKeyValidator";
import { getAuthSession } from "@/lib/auth";
import { getUserIdByEmail } from "@/lib/userHelper";

export async function GET(request: Request) {
  console.log("GET /api/keys/validate");
  
  // Check authentication
  const session = await getAuthSession();
  if (!session || !session.user?.email) {
    return NextResponse.json(
      {
        valid: false,
        error: "Unauthorized - Authentication required",
      },
      { status: 401 }
    );
  }

  const userEmail = session.user.email;
  const userId = await getUserIdByEmail(userEmail);
  
  if (!userId) {
    return NextResponse.json(
      {
        valid: false,
        error: "User not found",
      },
      { status: 404 }
    );
  }
  
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

  // Validate the API key using the common validator (with ownership check)
  const validationResult = await validateApiKey(apiKey, userId);

  if (!validationResult.valid) {
    return NextResponse.json({
      valid: false,
      error: validationResult.error,
    });
  }

  // All validations passed
  const keyData = validationResult.keyData!;

  return NextResponse.json({
    valid: true,
    message: "API key is valid",
    data: {
      id: keyData.id,
      name: keyData.name,
      usageCount: keyData.usage_count,
    },
  });
}

