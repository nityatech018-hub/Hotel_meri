import { describe, expect, it } from "vitest";
import { revenueByDay } from "./reports";
import type { Booking } from "./types";

const base: Booking = {
  id: "HMR-AAAAAA",
  guestName: "A",
  email: "a@x.com",
  phone: "1",
  categoryId: "deluxe",
  checkIn: "2026-12-01",
  checkOut: "2026-12-03",
  guests: 2,
  rooms: 1,
  status: "Confirmed",
  payment: "Unpaid",
  amountPaid: 0,
  total: 1000,
  source: "Website",
  createdAt: "2026-11-20",
};

describe("revenue report", () => {
  it("spreads a stay's total evenly across its nights", () => {
    const r = revenueByDay([base], "2026-12-01", 3);
    expect(r.map((d) => d.revenue)).toEqual([500, 500, 0]);
    expect(r[0]?.bookings).toBe(1);
  });
  it("ignores cancelled stays", () => {
    const r = revenueByDay([{ ...base, status: "Cancelled" }], "2026-12-01", 3);
    expect(r.every((d) => d.revenue === 0)).toBe(true);
  });
});
