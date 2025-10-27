"use client";

import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import { summarizeGithubRepo } from "../dashboard/keyActions";
import { useToast } from "../dashboard/useToast";
import Toast from "../dashboard/Toast";

export default function SummarizerPage() {
  const [apiKey, setApiKey] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast, showToast } = useToast();

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
    setReadmeContent(null); // Clear previous content

    try {
      const result = await summarizeGithubRepo(apiKey, githubUrl);

      if (result.success) {
        // Display the README content from the backend
        setReadmeContent(result.data?.readmeContent || "No README content available");
        showToast("Repository processed successfully!", "success");
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
      <div className="flex-1 p-8 overflow-auto relative">
        {/* Toggle Button - Only show when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-600 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300"
            aria-label="Open sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        <div className="mx-auto w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              GitHub Repository Summarizer
            </h1>
            <p className="text-gray-600">
              Enter your API key and GitHub repository URL to get a summary
            </p>
          </div>

          {/* Form Card */}
          <section className="rounded-2xl border border-black/[.08] bg-white shadow-sm p-6 mb-6">
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
          {readmeContent && (
            <section className="rounded-2xl border border-black/[.08] bg-white shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-6 w-6 text-green-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                README Content
              </h2>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {readmeContent}
                </pre>
              </div>
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
      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
}

