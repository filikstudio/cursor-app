"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AddModal from "./addModal";
import Sidebar from "./Sidebar";
import { fetchApiKeys, saveApiKey, deleteApiKey } from "./keyActions";
import { useToast } from "./useToast";
import Toast from "./Toast";
import Header from "@/components/Header";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<Array<{ id: string; name: string; usage: number; key: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [revealIds, setRevealIds] = useState<Record<string, boolean>>({});
  const { toast, showToast, hideToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Load from API
  useEffect(() => {
    if (status !== "authenticated") return;
    
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchApiKeys();
        if (isMounted) setRecords(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [status]);

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
        
        <div className="mx-auto w-full max-w-5xl">
        {/* API Keys Section */}
        <section className="rounded-xl sm:rounded-2xl border border-black/[.08] bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <h3 className="text-base sm:text-lg font-semibold">API Keys</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/[.08] text-gray-700 hover:bg-gray-50"
                aria-label="Add key"
                title="Add key"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="hidden sm:block text-sm text-gray-500">The key is used to authenticate your requests.</p>
          </div>

          {/* Header Row - Hidden on mobile, shown on desktop */}
          <div className="hidden md:grid grid-cols-12 items-center px-4 sm:px-5 py-2 text-xs font-medium text-gray-500">
            <div className="col-span-3">NAME</div>
            <div className="col-span-2">USAGE</div>
            <div className="col-span-5">KEY</div>
            <div className="col-span-2 text-right">OPTIONS</div>
          </div>
          <div className="hidden md:block h-px w-full bg-gray-100" />

          {/* Rows */}
          <ul className="divide-y divide-gray-100">
            {loading && (
              <li className="px-4 sm:px-5 py-8 text-sm text-gray-500">Loading…</li>
            )}
            {records.map((r, idx) => {
              const isInactive = r.usage >= 10;
              return (
              <li key={r.id}>
                {/* Mobile View - Card Layout */}
                <div className="md:hidden px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900 truncate">{r.name}</div>
                      {isInactive && (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 border border-red-200">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 ml-2">
                      {/* View/Hide */}
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50"
                        aria-label="Toggle visibility"
                        onClick={() => setRevealIds((prev) => ({ ...prev, [r.id]: !prev[r.id] }))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                          <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
                        </svg>
                      </button>
                      {/* Copy */}
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50"
                        aria-label="Copy"
                        onClick={async () => {
                          try {
                            await navigator.clipboard?.writeText(r.key);
                            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + 0.2);
                            showToast("Key copied to clipboard!", "success");
                          } catch (e) {
                            console.error("Failed to copy to clipboard:", e);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                          <path d="M8 7h9v10H8V7Zm-2 2H4v11h11v-2H6V9Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-500">Usage:</span>
                    <span className={`text-sm ${isInactive ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                      {r.usage}/10
                    </span>
                  </div>
                  <div className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50">
                    <span className="truncate block">
                      {revealIds[r.id] 
                        ? r.key 
                        : r.key.substring(0, 7) + '*'.repeat(Math.max(0, r.key.length - 7))
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${
                        isInactive
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (isInactive) return;
                        setEditId(r.id);
                        setNewName(r.name);
                        setNewKey(r.key);
                        setIsAddOpen(true);
                      }}
                      disabled={isInactive}
                      title={isInactive ? 'Cannot edit inactive key' : 'Edit key'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                        <path d="M13.8 6.2 3 17v4h4L17.8 10.2 13.8 6.2Zm1.4-1.4 2.8-2.8 4 4-2.8 2.8-4-4Z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                      onClick={async () => {
                        if (!confirm(`Delete key "${r.name}"?`)) return;
                        try {
                          await deleteApiKey(r.id);
                          setRecords((prev) => prev.filter((x) => x.id !== r.id));
                          showToast("Key deleted successfully!", "success");
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Z" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Desktop View - Table Layout */}
                <div className="hidden md:grid grid-cols-12 items-center px-4 sm:px-5 py-4">
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{r.name}</div>
                      {isInactive && (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 border border-red-200">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`col-span-2 ${isInactive ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                    {r.usage}/10
                  </div>
                  <div className="col-span-5">
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50">
                      <span className="truncate">
                        {revealIds[r.id] 
                          ? r.key 
                          : r.key.substring(0, 7) + '*'.repeat(Math.max(0, r.key.length - 7))
                        }
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-end gap-2 text-gray-600">
                      {/* View/Hide */}
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50"
                        aria-label="Toggle visibility"
                        onClick={() => setRevealIds((prev) => ({ ...prev, [r.id]: !prev[r.id] }))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                          <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
                        </svg>
                      </button>
                      {/* Copy */}
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50"
                        aria-label="Copy"
                        onClick={async () => {
                          try {
                            await navigator.clipboard?.writeText(r.key);
                            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + 0.2);
                            showToast("Key copied to clipboard!", "success");
                          } catch (e) {
                            console.error("Failed to copy to clipboard:", e);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                          <path d="M8 7h9v10H8V7Zm-2 2H4v11h11v-2H6V9Z" />
                        </svg>
                      </button>
                      {/* Edit */}
                      <button
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                          isInactive
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        aria-label="Edit"
                        onClick={() => {
                          if (isInactive) return;
                          setEditId(r.id);
                          setNewName(r.name);
                          setNewKey(r.key);
                          setIsAddOpen(true);
                        }}
                        disabled={isInactive}
                        title={isInactive ? 'Cannot edit inactive key' : 'Edit key'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                          <path d="M13.8 6.2 3 17v4h4L17.8 10.2 13.8 6.2Zm1.4-1.4 2.8-2.8 4 4-2.8 2.8-4-4Z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50"
                        aria-label="Delete"
                        onClick={async () => {
                          if (!confirm(`Delete key "${r.name}"?`)) return;
                          try {
                            await deleteApiKey(r.id);
                            setRecords((prev) => prev.filter((x) => x.id !== r.id));
                            showToast("Key deleted successfully!", "success");
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                          <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
            })}
            {!loading && records.length === 0 && (
              <li className="px-4 sm:px-5 py-8 text-sm text-gray-500">No keys yet. Use the + to add one.</li>
            )}
          </ul>
        </section>
      </div>

      {/* Add Key Modal */}
      <AddModal
        isOpen={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          setNewName("");
          setNewKey("");
          setEditId(null);
        }}
        title={editId ? "Edit API Key" : "Add API Key"}
        initialName={newName}
        initialKey={newKey}
        submitLabel={editId ? "Update" : "Save"}
        onSave={async (name, key) => {
          try {
            const result = await saveApiKey(name, key, editId);
            
            if (editId) {
              setRecords((prev) => prev.map((rec) => (rec.id === result.id ? result : rec)));
              showToast("Key updated successfully!", "success");
            } else {
              setRecords((prev) => [...prev, result]);
              showToast("Key created successfully!", "success");
            }
          } catch (e: any) {
            console.error(e);
            const errorMessage = e?.message || "Operation failed";
            showToast(errorMessage, "error");
            return;
          } finally {
            setIsAddOpen(false);
            setNewName("");
            setNewKey("");
            setEditId(null);
          }
        }}
      />

      {/* Toast notification */}
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />

        {/* Cancel button (bottom-right) */}
        <a
          href="/"
          className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-md bg-white text-black px-5 py-2.5 text-sm font-medium shadow border border-black/10 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          cancel
        </a>
      </div>
    </div>
  );
}


