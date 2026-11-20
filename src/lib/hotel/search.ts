import { addDays, todayISO } from "./pricing";
import type { CategoryId } from "./types";

export interface StaySearch {
  checkIn?: string | undefined;
  checkOut?: string | undefined;
  guests?: number | undefined;
  rooms?: number | undefined;
  category?: CategoryId | undefined;
}

const CATS: CategoryId[] = ["deluxe", "premium", "executive", "family", "suite"];
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(10, Math.floor(n)) : undefined;
};

export function validateStaySearch(s: Record<string, unknown>): StaySearch {
  return {
    checkIn: isDate(s["checkIn"]) ? s["checkIn"] : undefined,
    checkOut: isDate(s["checkOut"]) ? s["checkOut"] : undefined,
    guests: num(s["guests"]),
    rooms: num(s["rooms"]),
    category: CATS.includes(s["category"] as CategoryId)
      ? (s["category"] as CategoryId)
      : undefined,
  };
}

export function resolveStay(s: StaySearch) {
  const today = todayISO();
  const checkIn = s.checkIn && s.checkIn >= today ? s.checkIn : addDays(today, 1);
  const checkOut = s.checkOut && s.checkOut > checkIn ? s.checkOut : addDays(checkIn, 2);
  return { checkIn, checkOut, guests: s.guests ?? 2, rooms: s.rooms ?? 1, category: s.category };
}
