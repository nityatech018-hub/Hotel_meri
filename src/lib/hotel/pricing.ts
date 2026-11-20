import type { Booking, BookingStatus } from "./types";

const DAY = 86_400_000;

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y = 1970, m = 1, d = 1] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Number of nights between two dates; never less than 1. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const diff = Math.round(
    (parseISODate(checkOut).getTime() - parseISODate(checkIn).getTime()) / DAY,
  );
  return Math.max(1, diff);
}

export interface Quote {
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
}

/** Price × nights × rooms, plus tax (e.g. 0.12 for 12%), rounded to whole rupees. */
export function quoteStay(
  pricePerNight: number,
  checkIn: string,
  checkOut: string,
  rooms: number,
  taxRate: number,
): Quote {
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = pricePerNight * nights * Math.max(1, rooms);
  const tax = Math.round(subtotal * taxRate);
  return { nights, subtotal, tax, total: subtotal + tax };
}

/** Demo cancellation rule: guests may cancel online only 48+ hours (2+ days) before check-in. */
export const FREE_CANCEL_DAYS = 2;

export function canGuestCancel(
  booking: Pick<Booking, "status" | "checkIn">,
  today: string = todayISO(),
): boolean {
  const cancellable: BookingStatus[] = ["Pending", "Confirmed"];
  if (!cancellable.includes(booking.status)) return false;
  const daysAhead = Math.round(
    (parseISODate(booking.checkIn).getTime() - parseISODate(today).getTime()) / DAY,
  );
  return daysAhead >= FREE_CANCEL_DAYS;
}

/** Two stays overlap when one starts before the other ends (check-out day is free). */
export function datesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return aIn < bOut && bIn < aOut;
}

const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBookingId(
  existing: Iterable<string>,
  rand: () => number = Math.random,
): string {
  const taken = new Set(existing);
  for (;;) {
    let code = "";
    for (let i = 0; i < 6; i++) code += ID_CHARS[Math.floor(rand() * ID_CHARS.length)];
    const id = `HMR-${code}`;
    if (!taken.has(id)) return id;
  }
}

export function formatINR(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  return parseISODate(iso).toLocaleDateString("en-IN", opts);
}
