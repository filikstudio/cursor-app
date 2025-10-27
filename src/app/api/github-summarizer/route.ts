import { NextResponse } from "next/server";
import { validateApiKey, incrementApiKeyUsage } from "@/lib/apiKeyValidator";

export async function POST(request: Request) {
  console.log("POST /api/github-summarizer");

  try {
    const body = await request.json();
    const { apiKey, githubUrl } = body ?? {};

    // Check if required fields are provided
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API key is required",
        },
        { status: 400 }
      );
    }

    if (!githubUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "GitHub URL is required",
        },
        { status: 400 }
      );
    }

    // Validate the API key using the common validator
    const validationResult = await validateApiKey(apiKey);

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
        },
        { status: 401 }
      );
    }

    // API key is valid - increment usage count
    const keyData = validationResult.keyData!;
    await incrementApiKeyUsage(apiKey);

    // Validate GitHub URL format
    const githubRepoRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/i;
    if (!githubRepoRegex.test(githubUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid GitHub repository URL format. Expected: https://github.com/username/repo",
        },
        { status: 400 }
      );
    }

    // Extract owner and repo from GitHub URL
    const urlParts = githubUrl.replace(/https?:\/\/(www\.)?github\.com\//, '').split('/');
    const [owner, repo] = urlParts;

    try {
      // Fetch README content using GitHub API
      const readmeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3.raw'
          }
        }
      );

      if (!readmeResponse.ok) {
        return NextResponse.json(
          {
            success: false,
            error: "Could not find README for this repository",
          },
          { status: 404 }
        );
      }

      const readmeContent = await readmeResponse.text();

      // Update the success response to include README content
      return NextResponse.json({
        success: true,
        message: "GitHub repository README retrieved successfully",
        data: {
          githubUrl,
          apiKeyOwner: keyData.name,
          usageCount: keyData.usage_count + 1,
          readmeContent
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Error fetching repository README",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in github-summarizer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

