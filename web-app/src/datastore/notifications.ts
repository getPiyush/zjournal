import { isAuthRejection } from "./apiError";

// A tiny app-wide channel for "that worked" / "that failed" messages. Actions publish; the admin
// panel's <Toasts> subscribes. With no subscriber (the public site), notifying does nothing.

export type Notice = { id: number; kind: "success" | "error"; message: string };
type Listener = (notice: Notice) => void;

const listeners = new Set<Listener>();
let nextId = 1;

export const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const publish = (kind: Notice["kind"], message: string) => {
  const notice = { id: nextId++, kind, message };
  listeners.forEach((listener) => listener(notice));
};

export const notifySuccess = (message: string) => publish("success", message);

export const notifyError = (message: string, error?: unknown) => {
  // A rejected sign-in already sends the admin back to the sign-in screen with its own reason.
  if (isAuthRejection(error)) return;
  const detail = error instanceof Error && error.message ? error.message : "";
  publish("error", detail ? `${message}: ${detail}` : message);
};
