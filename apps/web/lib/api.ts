import { DayRecord, Store } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchDays(): Promise<Store | null> {
  if (!API_URL) return null;
  const response = await fetch(`${API_URL}/days`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load days");
  return response.json() as Promise<Store>;
}

export async function saveDay(dateKey: string, day: DayRecord): Promise<void> {
  if (!API_URL) return;
  const response = await fetch(`${API_URL}/days/${dateKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(day)
  });
  if (!response.ok) throw new Error("Could not save day");
}
