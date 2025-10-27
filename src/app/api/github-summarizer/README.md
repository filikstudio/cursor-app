# GitHub Summarizer Endpoint

## Endpoint
`POST /api/github-summarizer`

## Description
Validates an API key and processes a GitHub repository URL for summarization. The API key is validated using the same criteria as the validation endpoint.

## Request Body
```json
{
  "apiKey": "string (required)",
  "githubUrl": "string (required)"
}
```

## Validation Rules

### API Key Validation
1. **Length**: Key must be at least 10 characters long
2. **Prefix**: Key must start with 'stan'
3. **Existence**: Key must exist in the database

### GitHub URL Validation
- Must be a valid GitHub repository URL format
- Expected format: `https://github.com/username/repository`

## Usage Examples

### cURL
```bash
# Valid request
curl -X POST http://localhost:3000/api/github-summarizer \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "stan1234567890",
    "githubUrl": "https://github.com/facebook/react"
  }'

# Missing API key
curl -X POST http://localhost:3000/api/github-summarizer \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/facebook/react"
  }'
```

### JavaScript/TypeScript
```typescript
// Using the client-side function
import { summarizeGithubRepo } from "@/app/dashboard/keyActions";

const result = await summarizeGithubRepo(
  "stan1234567890",
  "https://github.com/facebook/react"
);

if (result.success) {
  console.log("Success:", result.data);
} else {
  console.error("Error:", result.error);
}

// Using fetch directly
const response = await fetch("/api/github-summarizer", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    apiKey: "stan1234567890",
    githubUrl: "https://github.com/facebook/react"
  })
});
const data = await response.json();
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "GitHub repository URL received and API key validated",
  "data": {
    "githubUrl": "https://github.com/facebook/react",
    "apiKeyOwner": "Key Name",
    "usageCount": 5
  }
}
```

### Error Responses

#### Missing API Key
```json
{
  "success": false,
  "error": "API key is required"
}
```

#### Invalid API Key (Too Short)
```json
{
  "success": false,
  "error": "API key must be at least 10 characters long"
}
```

#### Invalid API Key (Wrong Prefix)
```json
{
  "success": false,
  "error": "API key must start with 'stan'"
}
```

#### API Key Not Found
```json
{
  "success": false,
  "error": "API key not found in database"
}
```

#### Missing GitHub URL
```json
{
  "success": false,
  "error": "GitHub URL is required"
}
```

#### Invalid GitHub URL Format
```json
{
  "success": false,
  "error": "Invalid GitHub repository URL format. Expected: https://github.com/username/repo"
}
```

## Status Codes
- `200`: Success
- `400`: Bad request (missing or invalid parameters)
- `401`: Unauthorized (invalid API key)
- `500`: Internal server error

## Side Effects
When a request is successfully authenticated, the API key's `usage_count` is automatically incremented by 1 in the database.

## Notes
- The endpoint currently validates the request and returns success confirmation
- GitHub repository summarization logic should be implemented in the TODO section
- All GitHub URLs are validated against a standard format before processing

