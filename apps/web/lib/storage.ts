import { Store } from "@/lib/types";

const KEY = "chronicle-nextjs-store";

export function loadLocalStore(): Store | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Store;
  } catch {
    return null;
  }
}

export function saveLocalStore(store: Store): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
}
