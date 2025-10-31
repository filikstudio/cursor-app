"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "../dashboard/Sidebar";
import { validateApiKey } from "../dashboard/keyActions";
import { useToast } from "../dashboard/useToast";
import Toast from "../dashboard/Toast";
import Header from "@/components/Header";

export default function ValidatorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast, showToast } = useToast();

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      showToast("Please enter an API key", "error");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateApiKey(apiKey);
      
      if (result.valid) {
        // Redirect to protected page on success
        router.push("/protected");
      } else {
        // Show error toast on failure
        showToast("Invalid API key", "error");
      }
    } catch (error) {
      console.error("Validation error:", error);
      showToast("Invalid API key", "error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleValidate();
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
      <div className="flex-1 p-8 overflow-auto relative">
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(true)} />

        <div className="mx-auto w-full max-w-2xl">
          {/* Validator Card */}
          <section className="rounded-2xl border border-black/[.08] bg-white shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center justify-center rounded-lg bg-purple-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-purple-600">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">API Key Validator</h1>
                <p className="text-sm text-gray-500 mt-1">Enter your API key to validate access</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your API key (starts with 'stan')"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  disabled={isValidating}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Your API key should start with 'stan' and be at least 10 characters long
                </p>
              </div>

              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isValidating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 mr-2">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Validate API Key
                  </>
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Validation Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Must start with 'stan'</li>
                    <li>Must be at least 10 characters long</li>
                    <li>Must exist in the database</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Back button */}
          <a
            href="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-white text-black px-5 py-2.5 text-sm font-medium shadow border border-black/10 hover:bg-gray-100 transition-colors duration-200"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>

      {/* Toast notification */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
}

