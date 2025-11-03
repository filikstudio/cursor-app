export async function fetchApiKeys(): Promise<
  Array<{ id: string; name: string; usage: number; key: string }>
> {
  const res = await fetch("/api/keys", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load keys");
  return await res.json();
}

export async function saveApiKey(
  name: string,
  key: string,
  editId: string | null
): Promise<{ id: string; name: string; usage: number; key: string }> {
  if (editId) {
    // Update existing key
    const res = await fetch(`/api/keys/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, key }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Update failed" }));
      throw new Error(error.error || "Update failed");
    }
    return await res.json();
  } else {
    // Create new key
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, key }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Create failed" }));
      throw new Error(error.error || "Create failed");
    }
    return await res.json();
  }
}

export async function deleteApiKey(id: string): Promise<void> {
  const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  error?: string;
  message?: string;
  data?: {
    id: string;
    name: string;
    usageCount: number;
  };
}> {
  const res = await fetch(`/api/keys/validate?key=${encodeURIComponent(key)}`);
  return await res.json();
}

export async function summarizeGithubRepo(
  apiKey: string,
  githubUrl: string
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  data?: {
    githubUrl: string;
    apiKeyOwner: string;
    usageCount: number;
    summary?: string;
    coolFacts?: string[];
    stars?: number;
    latestVersion?: string | null;
  };
}> {
  const res = await fetch("/api/github-summarizer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey, githubUrl }),
  });
  return await res.json();
}

