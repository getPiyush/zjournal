import { useEffect, useRef, useState } from "react";
import { Notice, subscribe } from "../datastore/notifications";

// Success messages fade on their own. Errors stay until dismissed, so they aren't missed.
const SUCCESS_TIMEOUT_MS = 4000;
const MAX_VISIBLE = 4;

export default function Toasts() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = (id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setNotices((current) => current.filter((notice) => notice.id !== id));
  };

  useEffect(() => {
    const pending = timers.current;
    const unsubscribe = subscribe((notice) => {
      setNotices((current) => [...current, notice].slice(-MAX_VISIBLE));
      if (notice.kind === "success") {
        pending.set(notice.id, setTimeout(() => dismiss(notice.id), SUCCESS_TIMEOUT_MS));
      }
    });
    return () => {
      unsubscribe();
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1090 }}>
      {notices.map((notice) => (
        <div
          key={notice.id}
          className={`toast show align-items-center text-white border-0 ${
            notice.kind === "success" ? "bg-success" : "bg-danger"
          }`}
          role={notice.kind === "error" ? "alert" : "status"}
          aria-live={notice.kind === "error" ? "assertive" : "polite"}
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">
              <i className={`bi ${notice.kind === "success" ? "bi-check-circle" : "bi-exclamation-triangle"} me-2`} />
              {notice.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Dismiss"
              onClick={() => dismiss(notice.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
