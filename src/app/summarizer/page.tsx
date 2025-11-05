"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "../dashboard/Sidebar";
import { summarizeGithubRepo } from "../dashboard/keyActions";
import { useToast } from "../dashboard/useToast";
import Toast from "../dashboard/Toast";
import Header from "@/components/Header";

export default function SummarizerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [coolFacts, setCoolFacts] = useState<string[]>([]);
  const [stars, setStars] = useState<number | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      showToast("Please enter an API key", "error");
      return;
    }

    if (!githubUrl.trim()) {
      showToast("Please enter a GitHub repository URL", "error");
      return;
    }

    setIsSubmitting(true);
    setSummary(null); // Clear previous content
    setCoolFacts([]);
    setStars(null);
    setLatestVersion(null);

    try {
      const result = await summarizeGithubRepo(apiKey, githubUrl);

      if (result.success) {
        // Display the summary and cool facts from the backend
        setSummary(result.data?.summary || "No summary available");
        setCoolFacts(result.data?.coolFacts || []);
        setStars(result.data?.stars ?? null);
        setLatestVersion(result.data?.latestVersion ?? null);
        showToast("Repository summarized successfully!", "success");
      } else {
        showToast(result.error || "Failed to process repository", "error");
      }
    } catch (error) {
      console.error("Summarization error:", error);
      showToast("Failed to process repository", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#fafafa]">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 overflow-auto relative pt-20 sm:pt-8 lg:pt-8">
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(true)} />

        <div className="mx-auto w-full max-w-4xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              GitHub Repository Summarizer
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Enter your API key and GitHub repository URL to get a summary
            </p>
          </div>

          {/* Form Card */}
          <section className="rounded-xl sm:rounded-2xl border border-black/[.08] bg-white shadow-sm p-4 sm:p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* API Key Input */}
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  API Key *
                </label>
                <input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key (starts with 'stan')"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  disabled={isSubmitting}
                />
              </div>

              {/* GitHub URL Input */}
              <div>
                <label
                  htmlFor="githubUrl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  GitHub Repository URL *
                </label>
                <input
                  type="text"
                  id="githubUrl"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 mr-2"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Summarize Repository
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Results Section */}
          {summary && (
            <section className="rounded-2xl border border-black/[.08] bg-white shadow-sm p-6 space-y-6">
              {/* Repository Stats */}
              {(stars !== null || latestVersion) && (
                <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-200">
                  {stars !== null && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">{stars.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">stars</span>
                    </div>
                  )}
                  {latestVersion && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5 text-blue-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">Latest version:</span>
                      <span className="font-semibold">{latestVersion}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Section */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-6 w-6 text-blue-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Summary
                </h2>
                <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                  {summary}
                </p>
              </div>

              {/* Cool Facts Section */}
              {coolFacts.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-6 w-6 text-purple-600"
                    >
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                    </svg>
                    Cool Facts
                  </h2>
                  <ul className="space-y-2">
                    {coolFacts.map((fact, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-gray-700 bg-purple-50 p-3 rounded-lg border border-purple-100"
                      >
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="flex-1">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Back button */}
          <div className="mt-6">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-white text-black px-5 py-2.5 text-sm font-medium shadow border border-black/10 hover:bg-gray-100 transition-colors duration-200"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
}

