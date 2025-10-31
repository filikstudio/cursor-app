"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "../dashboard/Sidebar";
import Header from "@/components/Header";

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

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

        <div className="mx-auto w-full max-w-4xl">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-6 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-16 w-16 text-green-600">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Protected Text */}
              <h1 className="text-6xl font-bold text-gray-900 mb-4">Protected</h1>
              <p className="text-xl text-gray-600 mb-8">
                You have successfully accessed the protected area.
              </p>
              
              {/* Badge */}
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 mr-2">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                Access Granted
              </div>
              
              {/* Action Buttons */}
              <div className="mt-12 flex gap-4 justify-center">
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Go to Dashboard
                </a>
                <a
                  href="/validator"
                  className="inline-flex items-center justify-center rounded-lg bg-white text-gray-900 px-6 py-3 text-sm font-semibold shadow border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  Test Another Key
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

