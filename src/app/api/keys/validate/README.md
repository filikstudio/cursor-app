# API Key Validation Endpoint

## Endpoint
`GET /api/keys/validate`

## Description
Validates an API key based on multiple criteria and increments its usage count if valid.

## Query Parameters
- `key` (required): The API key to validate

## Validation Rules
1. **Length**: Key must be at least 10 characters long
2. **Prefix**: Key must start with 'stan'
3. **Existence**: Key must exist in the database

## Usage Examples

### cURL
```bash
# Valid key example
curl "http://localhost:3000/api/keys/validate?key=stan1234567890"

# Invalid key (too short)
curl "http://localhost:3000/api/keys/validate?key=stan123"

# Invalid key (wrong prefix)
curl "http://localhost:3000/api/keys/validate?key=john1234567890"
```

### JavaScript/TypeScript
```typescript
// Using the client-side function
import { validateApiKey } from "@/app/dashboard/keyActions";

const result = await validateApiKey("stan1234567890");

if (result.valid) {
  console.log("Key is valid:", result.data);
} else {
  console.error("Key is invalid:", result.error);
}

// Using fetch directly
const response = await fetch("/api/keys/validate?key=stan1234567890");
const data = await response.json();
```

## Response Format

### Success Response (Valid Key)
```json
{
  "valid": true,
  "message": "API key is valid",
  "data": {
    "id": "uuid-here",
    "name": "Key Name",
    "usageCount": 5
  }
}
```

### Error Response (Invalid Key)
```json
{
  "valid": false,
  "error": "API key must start with 'stan'"
}
```

### Error Response (Missing Parameter)
```json
{
  "valid": false,
  "error": "API key parameter is required"
}
```

## Status Codes
- `200`: Validation completed (check `valid` field in response)
- `400`: Bad request (missing key parameter)
- `500`: Internal server error

## Side Effects
When a key is successfully validated, its `usage_count` is automatically incremented by 1 in the database.

