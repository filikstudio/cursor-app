"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-white border-2 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
        aria-label="Profile menu"
      >
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "Profile"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isProfileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsProfileMenuOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

