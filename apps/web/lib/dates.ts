import { Store } from "@/lib/types";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const shortDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

export function formatMonth(date: Date): string {
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function monthName(date: Date): string {
  return months[date.getMonth()];
}

export function dayName(date: Date): string {
  return shortDays[date.getDay()];
}

export function shortDate(date: Date): string {
  return `${months[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

export function seedStore(): Store {
  const today = new Date();
  const k = (offset: number) => dateKey(addDays(today, offset));

  return {
    days: {
      [k(-4)]: {
        journal: "Started before I felt ready. That still counts.",
        reflection: "",
        mood: 3,
        energy: 3,
        tasks: [
          { id: "seed-1", title: "Draft product notes", done: true },
          { id: "seed-2", title: "Walk after lunch", done: false }
        ]
      },
      [k(-1)]: {
        journal: "A slower day. Useful in the way quiet things are useful.",
        reflection: "",
        mood: 4,
        energy: 2,
        tasks: [
          { id: "seed-3", title: "Buy groceries", done: true },
          { id: "seed-4", title: "Plan tomorrow", done: false }
        ]
      },
      [k(0)]: {
        journal: "",
        reflection: "",
        mood: 0,
        energy: 0,
        tasks: [
          { id: "seed-5", title: "Morning pages", done: true },
          { id: "seed-6", title: "Review backend routes", done: false },
          { id: "seed-7", title: "Sketch API payloads", done: false },
          { id: "seed-8", title: "30 min reading", done: false }
        ]
      }
    }
  };
}
