"use client";

import { useEffect, useState } from "react";

type AddModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onSave: (name: string, key: string) => void;
  title?: string;
  initialName?: string;
  initialKey?: string;
  submitLabel?: string;
};

export default function AddModal({ isOpen, onCancel, onSave, title = "Add API Key", initialName = "", initialKey = "", submitLabel = "Save" }: AddModalProps) {
  const [name, setName] = useState(initialName);
  const [key, setKey] = useState(initialKey);
  const [nameError, setNameError] = useState("");

  // Generate key in format: stan-[16 characters]
  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'stan-';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setKey(initialKey || generateKey());
      setNameError("");
    }
  }, [isOpen, initialName, initialKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-black/[.08] bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold">{title}</h4>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50"
            aria-label="Close"
            onClick={onCancel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
              <path d="M6.4 4.9 4.9 6.4 10.5 12l-5.6 5.6 1.5 1.5L12 13.5l5.6 5.6 1.5-1.5L13.5 12l5.6-5.6-1.5-1.5L12 10.5 6.4 4.9Z" />
            </svg>
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmedName = name.trim();
            const trimmedKey = key.trim();
            
            // Validate name
            if (trimmedName.length < 8) {
              setNameError("Name must be at least 8 characters long");
              return;
            }
            if (/\s/.test(trimmedName)) {
              setNameError("Name cannot contain whitespaces");
              return;
            }
            
            if (!trimmedName || !trimmedKey) return;
            onSave(trimmedName, trimmedKey);
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 ${
                nameError 
                  ? "border-red-300 bg-red-50 focus:border-red-500" 
                  : "border-gray-300 bg-white focus:border-blue-500"
              }`}
              placeholder="e.g., my-service-key (min 8 chars, no spaces)"
              required
            />
            {nameError && (
              <p className="mt-1 text-xs text-red-600">{nameError}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Key</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={key}
                readOnly
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none"
              />
              <button
                type="button"
                onClick={() => setKey(generateKey())}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                🔄
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Auto-generated key. Click 🔄 to regenerate.</p>
          </div>
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-black/[.08] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


