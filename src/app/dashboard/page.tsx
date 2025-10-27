"use client";

import { useEffect, useState } from "react";
import AddModal from "./addModal";
import Sidebar from "./Sidebar";
import { fetchApiKeys, saveApiKey, deleteApiKey } from "./keyActions";
import { useToast } from "./useToast";
import Toast from "./Toast";

export default function DashboardPage() {
  const [records, setRecords] = useState<Array<{ id: string; name: string; usage: number; key: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [revealIds, setRevealIds] = useState<Record<string, boolean>>({});
  const { toast, showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load from API
  useEffect(() => {
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
  }, []);

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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        <div className="mx-auto w-full max-w-5xl">
        {/* API Keys Section */}
        <section className="rounded-2xl border border-black/[.08] bg-white shadow-sm">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">API Keys</h3>
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

          {/* Header Row */}
          <div className="grid grid-cols-12 items-center px-4 sm:px-5 py-2 text-xs font-medium text-gray-500">
            <div className="col-span-3">NAME</div>
            <div className="col-span-2">USAGE</div>
            <div className="col-span-5">KEY</div>
            <div className="col-span-2 text-right">OPTIONS</div>
          </div>
          <div className="h-px w-full bg-gray-100" />

          {/* Rows */}
          <ul className="divide-y divide-gray-100">
            {loading && (
              <li className="px-4 sm:px-5 py-8 text-sm text-gray-500">Loading…</li>
            )}
            {records.map((r, idx) => (
              <li key={r.id} className="grid grid-cols-12 items-center px-4 sm:px-5 py-4">
                <div className="col-span-3">
                  <div className="font-medium text-gray-900">{r.name}</div>
                </div>
                <div className="col-span-2 text-gray-700">{r.usage}</div>
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
                          // Play success sound
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
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50"
                      aria-label="Edit"
                      onClick={() => {
                        setEditId(r.id);
                        setNewName(r.name);
                        setNewKey(r.key);
                        setIsAddOpen(true);
                      }}
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
                          showToast("Key deleted successfully!", "error");
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
              </li>
            ))}
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
          } catch (e) {
            console.error(e);
          } finally {
            setIsAddOpen(false);
            setNewName("");
            setNewKey("");
            setEditId(null);
          }
        }}
      />

      {/* Toast notification */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />

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


