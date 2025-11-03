import { NextResponse } from "next/server";
import { validateApiKey, incrementApiKeyUsage } from "@/lib/apiKeyValidator";
import { summarizeGithubReadme } from "@/lib/githubSummarizer";
import { getAuthSession } from "@/lib/auth";
import { getUserIdByEmail } from "@/lib/userHelper";

export async function POST(request: Request) {
  console.log("\n=== POST /api/github-summarizer ===");
  console.log("Timestamp:", new Date().toISOString());

  // Check authentication
  const session = await getAuthSession();
  if (!session || !session.user?.email) {
    return NextResponse.json(
      {
        success: false,
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
        success: false,
        error: "User not found",
      },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { apiKey, githubUrl } = body ?? {};
    console.log("Request body:", { apiKey: apiKey ? "***" + apiKey.slice(-4) : "missing", githubUrl });

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

    // Validate the API key using the common validator (with ownership check)
    console.log("Validating API key...");
    const validationResult = await validateApiKey(apiKey, userId);
    console.log("API key validation result:", validationResult.valid ? "✓ Valid" : "✗ Invalid");

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
        },
        { status: 401 }
      );
    }

    // API key is valid
    const keyData = validationResult.keyData!;
    console.log("API key owner:", keyData.name);

    // Validate GitHub URL format
    console.log("Validating GitHub URL format...");
    const githubRepoRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/i;
    if (!githubRepoRegex.test(githubUrl)) {
      console.log("✗ Invalid GitHub URL format");

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
    console.log("✓ Valid GitHub URL - Owner:", owner, "Repo:", repo);

    try {
      // Fetch repository info and README in parallel
      console.log("Fetching repository info from GitHub API...");
      const [repoResponse, readmeResponse, releasesResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}`),
        fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
          headers: {
            'Accept': 'application/vnd.github.v3.raw'
          }
        }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`)
      ]);

      let starsCount = 0;
      let latestVersion: string | null = null;

      if (repoResponse.ok) {
        const repoData = await repoResponse.json();
        starsCount = repoData.stargazers_count || 0;
        console.log("✓ Repository stars:", starsCount);
      } else {
        console.log("⚠ Could not fetch repository info");
      }

      if (releasesResponse.ok) {
        const releaseData = await releasesResponse.json();
        latestVersion = releaseData.tag_name || releaseData.name || null;
        console.log("✓ Latest version:", latestVersion);
      } else {
        console.log("⚠ Could not fetch latest release");
      }

      if (!readmeResponse.ok) {
        console.log("✗ Failed to fetch README - Status:", readmeResponse.status);
        return NextResponse.json(
          {
            success: false,
            error: "Could not find README for this repository",
          },
          { status: 404 }
        );
      }

      const readmeContent = await readmeResponse.text();
      console.log("✓ README fetched successfully - Length:", readmeContent.length, "characters");

      // Summarize the README using LLM
      console.log("Starting LLM summarization...");
      const startTime = Date.now();
      const summary = await summarizeGithubReadme(readmeContent);
      const duration = Date.now() - startTime;
      console.log("✓ Summarization complete - Duration:", duration, "ms");
      console.log("Summary length:", summary.summary.length, "chars, Cool facts:", summary.coolFacts.length);

      // Increment usage count only after everything succeeds
      await incrementApiKeyUsage(apiKey);

      // Return the summarized content
      console.log("=== Request completed successfully ===\n");
      return NextResponse.json({
        success: true,
        message: "GitHub repository README summarized successfully",
        data: {
          githubUrl,
          apiKeyOwner: keyData.name,
          usageCount: keyData.usage_count + 1,
          summary: summary.summary,
          coolFacts: summary.coolFacts,
          stars: starsCount,
          latestVersion,
        },
      });
    } catch (error) {
      console.error("✗ Error in GitHub/LLM processing:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Error fetching repository README",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("✗ Fatal error in github-summarizer:", error);
    console.log("=== Request failed ===\n");
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
