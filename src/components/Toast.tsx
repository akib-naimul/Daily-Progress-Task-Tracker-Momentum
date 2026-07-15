"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type Toast = { id: number; msg: string };
type ToastCtx = { notify: (msg: string) => void };

const Ctx = createContext<ToastCtx>({ notify: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const notify = useCallback((msg: string) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="toast-wrap" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div className="toast" key={t.id} role="status">
            <span className="toast-msg">{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
