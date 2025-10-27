import { ToastType } from "./useToast";

interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
}

export default function Toast({ show, message, type }: ToastProps) {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out animate-[slideInBounce_0.6s_ease-out]">
      <div className={`rounded-lg text-white px-4 py-3 shadow-2xl backdrop-blur-sm ${
        type === "error" 
          ? "bg-gradient-to-r from-red-500 to-red-600 border border-red-400/20" 
          : "bg-gradient-to-r from-green-500 to-green-600 border border-green-400/20"
      }`}>
        <div className="flex items-center gap-3">
          <div className="animate-[pulse_1s_ease-in-out_infinite]">
            {type === "error" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-sm font-semibold tracking-wide">{message}</span>
          <div className="w-2 h-2 bg-white/30 rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        </div>
        <div className="absolute bottom-0 left-0 h-1 bg-white/40 rounded-full animate-[shrink_3s_linear_forwards]"></div>
      </div>
    </div>
  );
}

