import { useSyncExternalStore } from "react";
import { createSeedState, STATE_VERSION } from "./data";
import { datesOverlap, generateBookingId, quoteStay, todayISO } from "./pricing";
import type {
  Booking,
  BookingStatus,
  CategoryId,
  HotelSettings,
  HotelState,
  PaymentStatus,
  Role,
  RoomCategory,
  RoomStatus,
  Session,
  UserAccount,
} from "./types";

/**
 * Demo data layer: everything lives in the browser (localStorage).
 * Swap these actions for real API calls when a backend is added.
 */
const KEY = "meri-hotel-demo-v1";
const serverState = createSeedState();
let state: HotelState | null = null;
const listeners = new Set<() => void>();

function load(): HotelState {
  if (typeof window === "undefined") return serverState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HotelState;
      if (parsed.version === STATE_VERSION) {
        // Images are bundle URLs; always refresh them from code.
        const fresh = createSeedState();
        parsed.categories = parsed.categories.map((c) => ({
          ...c,
          image: fresh.categories.find((f) => f.id === c.id)?.image ?? c.image,
        }));
        return parsed;
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return createSeedState();
}

function getState(): HotelState {
  if (!state) state = load();
  return state;
}

function setState(updater: (s: HotelState) => HotelState) {
  state = updater(getState());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or disabled */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useHotel<T>(selector: (s: HotelState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(serverState),
  );
}

export const useHotelState = () => useHotel((s) => s);

/* ---------- derived helpers ---------- */

const ACTIVE: BookingStatus[] = ["Pending", "Confirmed", "Checked-In"];

export function availableUnits(
  s: HotelState,
  categoryId: CategoryId,
  checkIn: string,
  checkOut: string,
  ignoreBookingId?: string,
): number {
  const total = s.rooms.filter(
    (r) => r.categoryId === categoryId && r.status !== "maintenance",
  ).length;
  const used = s.bookings
    .filter(
      (b) =>
        b.id !== ignoreBookingId &&
        b.categoryId === categoryId &&
        ACTIVE.includes(b.status) &&
        datesOverlap(b.checkIn, b.checkOut, checkIn, checkOut),
    )
    .reduce((sum, b) => sum + b.rooms, 0);
  return Math.max(0, total - used);
}

export function occupiedRoomNumbers(s: HotelState): Set<string> {
  return new Set(
    s.bookings.filter((b) => b.status === "Checked-In" && b.roomNumber).map((b) => b.roomNumber!),
  );
}

export function freeRoomsFor(s: HotelState, categoryId: CategoryId): string[] {
  const occ = occupiedRoomNumbers(s);
  return s.rooms
    .filter((r) => r.categoryId === categoryId && r.status === "available" && !occ.has(r.number))
    .map((r) => r.number);
}

export function getCategory(s: HotelState, id: CategoryId): RoomCategory {
  return s.categories.find((c) => c.id === id) ?? s.categories[0]!;
}

/* ---------- actions ---------- */

export interface NewBookingInput {
  guestName: string;
  email: string;
  phone: string;
  categoryId: CategoryId;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  requests?: string | undefined;
  source: Booking["source"];
  status?: BookingStatus;
  payment?: PaymentStatus;
  amountPaid?: number;
  roomNumber?: string | undefined;
}

export function createBooking(input: NewBookingInput): Booking {
  const s = getState();
  const cat = getCategory(s, input.categoryId);
  const q = quoteStay(cat.price, input.checkIn, input.checkOut, input.rooms, s.settings.taxRate);
  const booking: Booking = {
    id: generateBookingId(s.bookings.map((b) => b.id)),
    guestName: input.guestName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    categoryId: input.categoryId,
    roomNumber: input.roomNumber,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    rooms: input.rooms,
    status: input.status ?? "Pending",
    payment: input.payment ?? "Unpaid",
    amountPaid: input.amountPaid ?? 0,
    total: q.total,
    source: input.source,
    createdAt: todayISO(),
    requests: input.requests?.trim() || undefined,
  };
  setState((st) => ({ ...st, bookings: [booking, ...st.bookings] }));
  return booking;
}

export function updateBooking(id: string, patch: Partial<Booking>) {
  setState((st) => ({
    ...st,
    bookings: st.bookings.map((b) => {
      if (b.id !== id) return b;
      const next = { ...b, ...patch };
      if (patch.checkIn || patch.checkOut || patch.rooms || patch.categoryId) {
        const cat = getCategory(st, next.categoryId);
        next.total = quoteStay(
          cat.price,
          next.checkIn,
          next.checkOut,
          next.rooms,
          st.settings.taxRate,
        ).total;
      }
      return next;
    }),
  }));
}

export function setBookingStatus(id: string, status: BookingStatus) {
  const b = getState().bookings.find((x) => x.id === id);
  const patch: Partial<Booking> = { status };
  if (status === "Cancelled" && b && b.amountPaid > 0) patch.payment = "Refunded";
  if (status === "Checked-Out" && b) {
    patch.payment = "Paid";
    patch.amountPaid = b.total;
  }
  updateBooking(id, patch);
}

export function checkInBooking(id: string, roomNumber: string) {
  updateBooking(id, { status: "Checked-In", roomNumber });
}

export function checkOutBooking(id: string) {
  const b = getState().bookings.find((x) => x.id === id);
  setBookingStatus(id, "Checked-Out");
  if (b?.roomNumber) setRoomStatus(b.roomNumber, "cleaning");
}

export function recordPayment(id: string, amount: number) {
  const b = getState().bookings.find((x) => x.id === id);
  if (!b) return;
  const paid = Math.min(b.total, b.amountPaid + amount);
  updateBooking(id, {
    amountPaid: paid,
    payment: paid >= b.total ? "Paid" : paid > 0 ? "Partial" : "Unpaid",
  });
}

export function setRoomStatus(number: string, status: RoomStatus) {
  setState((st) => ({
    ...st,
    rooms: st.rooms.map((r) => (r.number === number ? { ...r, status } : r)),
  }));
}

export function updateCategoryPrice(id: CategoryId, price: number) {
  setState((st) => ({
    ...st,
    categories: st.categories.map((c) => (c.id === id ? { ...c, price } : c)),
  }));
}

export function updateSettings(patch: Partial<HotelSettings>) {
  setState((st) => ({ ...st, settings: { ...st.settings, ...patch } }));
}

export function resetDemoData() {
  setState(() => createSeedState());
}

/* ---------- demo auth (NOT real security) ---------- */

export function login(email: string, password: string, role: Role): Session | string {
  const u = getState().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || u.password !== password) return "Email or password is incorrect.";
  if (u.role !== role)
    return role === "reception"
      ? "This account is not a reception account."
      : "Please use Reception login for staff accounts.";
  const session: Session = { email: u.email, name: u.name, role: u.role };
  setState((st) => ({ ...st, session }));
  return session;
}

export function register(input: Omit<UserAccount, "role">): Session | string {
  const s = getState();
  if (s.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase()))
    return "An account with this email already exists.";
  const user: UserAccount = { ...input, email: input.email.trim().toLowerCase(), role: "guest" };
  const session: Session = { email: user.email, name: user.name, role: "guest" };
  setState((st) => ({ ...st, users: [...st.users, user], session }));
  return session;
}

export function logout() {
  setState((st) => ({ ...st, session: null }));
}

export function updateProfile(
  email: string,
  patch: Partial<Pick<UserAccount, "name" | "phone" | "city">>,
) {
  setState((st) => ({
    ...st,
    users: st.users.map((u) => (u.email === email ? { ...u, ...patch } : u)),
    session:
      st.session && st.session.email === email
        ? { ...st.session, name: patch.name ?? st.session.name }
        : st.session,
  }));
}

export function sendSupportMessage(email: string, subject: string, message: string) {
  setState((st) => ({
    ...st,
    messages: [
      { id: crypto.randomUUID(), email, subject, message, createdAt: todayISO() },
      ...st.messages,
    ],
  }));
}
