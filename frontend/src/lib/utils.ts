import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeString(timeString: string): string {
  if (!timeString) return "";
  // Accepts "09:00", "9:00", "09:00:00", "9:00:00"
  const match = timeString.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return timeString;
  const [, h, m] = match;
  const date = new Date(0, 0, 0, Number(h), Number(m));
  return format(date, 'p'); // e.g., "9:00 AM"
}
