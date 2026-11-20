import { describe, expect, it } from "vitest";
import {
  canGuestCancel,
  datesOverlap,
  generateBookingId,
  nightsBetween,
  quoteStay,
} from "./pricing";

describe("stay pricing", () => {
  it("charges price × nights × rooms plus 12% tax", () => {
    const q = quoteStay(3499, "2026-12-01", "2026-12-04", 2, 0.12);
    expect(q.nights).toBe(3);
    expect(q.subtotal).toBe(20994);
    expect(q.tax).toBe(2519);
    expect(q.total).toBe(23513);
  });

  it("counts at least one night", () => {
    expect(nightsBetween("2026-12-01", "2026-12-01")).toBe(1);
  });
});

describe("demo cancellation rule", () => {
  it("lets a guest cancel a confirmed booking 2 days before check-in", () => {
    expect(canGuestCancel({ status: "Confirmed", checkIn: "2026-12-03" }, "2026-12-01")).toBe(true);
  });
  it("blocks guest cancellation the day before check-in", () => {
    expect(canGuestCancel({ status: "Confirmed", checkIn: "2026-12-02" }, "2026-12-01")).toBe(
      false,
    );
  });
  it("blocks cancelling a stay that is already checked in", () => {
    expect(canGuestCancel({ status: "Checked-In", checkIn: "2026-12-10" }, "2026-12-01")).toBe(
      false,
    );
  });
});

describe("availability and ids", () => {
  it("treats the check-out day as free for the next guest", () => {
    expect(datesOverlap("2026-12-01", "2026-12-03", "2026-12-03", "2026-12-05")).toBe(false);
    expect(datesOverlap("2026-12-01", "2026-12-04", "2026-12-03", "2026-12-05")).toBe(true);
  });
  it("never reuses an existing booking id", () => {
    let calls = 0;
    const rand = () => (calls++ < 6 ? 0 : 0.5);
    const id = generateBookingId(["HMR-AAAAAA"], rand);
    expect(id).not.toBe("HMR-AAAAAA");
    expect(id).toMatch(/^HMR-[A-Z2-9]{6}$/);
  });
});
