"use client";

import { usePathname } from "next/navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    } fixed lg:static h-screen z-50`}>
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Key store</h1>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          <li>
            <a 
              href="/dashboard" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/dashboard" 
                  ? "text-purple-600 bg-purple-50" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
              </svg>
              Dashboard
            </a>
          </li>
          <li>
            <a 
              href="/validator" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                pathname === "/validator" 
                  ? "text-purple-600 bg-purple-50" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Validator
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

