"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          API Key Manager
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your API keys and access protected resources
        </p>
        <a
          href="/auth/signin"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 text-base font-medium shadow-lg transition-all duration-200 ease-out hover:from-purple-700 hover:to-pink-700"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
