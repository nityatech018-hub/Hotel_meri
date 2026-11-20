import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { selectCls } from "@/components/dashboard/BookingDialog";
import { Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDays, formatDate, formatINR, quoteStay, todayISO } from "@/lib/hotel/pricing";
import {
  availableUnits,
  createBooking,
  freeRoomsFor,
  getCategory,
  useHotelState,
} from "@/lib/hotel/store";
import type { Booking, CategoryId } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reception/new")({
  component: NewBooking,
});

function NewBooking() {
  const state = useHotelState();
  const navigate = useNavigate();
  const today = todayISO();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [categoryId, setCategoryId] = useState<CategoryId>("deluxe");
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(addDays(today, 1));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [roomNumber, setRoomNumber] = useState("");
  const [source, setSource] = useState<Booking["source"]>("Walk-in");
  const [paid, setPaid] = useState(0);
  const [checkInNow, setCheckInNow] = useState(true);
  const [requests, setRequests] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  const cat = getCategory(state, categoryId);
  const q = quoteStay(cat.price, checkIn, checkOut, rooms, state.settings.taxRate);
  const left = availableUnits(state, categoryId, checkIn, checkOut);
  const free = freeRoomsFor(state, categoryId);
  const canCheckIn = checkIn === today && rooms === 1;
  const valid =
    name.trim().length > 1 &&
    phone.replace(/\D/g, "").length >= 8 &&
    checkOut > checkIn &&
    left >= rooms &&
    guests <= cat.maxGuests * rooms &&
    (!checkInNow || !canCheckIn || roomNumber);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setTimeout(() => {
      const amount = Math.min(q.total, Math.max(0, paid));
      const b = createBooking({
        guestName: name,
        phone,
        email: email || `${name.trim().toLowerCase().replace(/\s+/g, ".")}@walkin.local`,
        categoryId,
        checkIn,
        checkOut,
        guests,
        rooms,
        requests,
        source,
        status: checkInNow && canCheckIn ? "Checked-In" : "Confirmed",
        payment: amount >= q.total ? "Paid" : amount > 0 ? "Partial" : "Unpaid",
        amountPaid: amount,
        roomNumber: roomNumber || undefined,
      });
      setBusy(false);
      setDone(b);
      toast.success(`Reservation ${b.id} created`);
    }, 600);
  }

  if (done)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-lift"
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.15 }}
        >
          <CheckCircle2 className="mx-auto size-16 text-success" strokeWidth={1.3} />
        </motion.div>
        <h2 className="mt-4 font-display text-4xl text-navy">Reservation created</h2>
        <p className="mt-2 text-muted-foreground">
          {done.guestName} · {getCategory(state, done.categoryId).name}
          {done.roomNumber ? ` · Room ${done.roomNumber}` : ""}
        </p>
        <p className="mt-4 font-display text-3xl tracking-wider text-gold">{done.id}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="navy">
            <Link to="/invoice/$bookingId" params={{ bookingId: done.id }}>
              View invoice
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDone(null);
              setName("");
              setPhone("");
              setEmail("");
              setRoomNumber("");
              setPaid(0);
              setRequests("");
            }}
          >
            New reservation
          </Button>
          <Button variant="ghost" onClick={() => navigate({ to: "/reception/bookings" })}>
            All bookings
          </Button>
        </div>
      </motion.div>
    );

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-3">
      <Panel
        title="Walk-in reservation"
        subtitle="Create a booking for a guest at the desk or on the phone"
        className="xl:col-span-2"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Guest name *</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name as on ID"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone *</Label>
            <Input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Room category</Label>
            <div className="grid gap-2 sm:grid-cols-5">
              {state.categories.map((c) => {
                const l = availableUnits(state, c.id, checkIn, checkOut);
                return (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    key={c.id}
                    onClick={() => {
                      setCategoryId(c.id);
                      setRoomNumber("");
                    }}
                    className={cn(
                      "rounded-xl border p-3 text-left transition",
                      categoryId === c.id
                        ? "border-gold bg-accent/60 shadow-gold"
                        : "border-border hover:border-gold/60",
                    )}
                  >
                    <p className="text-sm font-medium text-navy">{c.name.replace(" Room", "")}</p>
                    <p className="text-xs text-muted-foreground">{formatINR(c.price)}</p>
                    <p
                      className={cn(
                        "mt-1 text-[0.7rem]",
                        l === 0 ? "text-destructive" : "text-success",
                      )}
                    >
                      {l} free
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Check-in</Label>
            <Input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 1));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Check-out</Label>
            <Input
              type="date"
              min={addDays(checkIn, 1)}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Guests</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Rooms</Label>
            <Input
              type="number"
              min={1}
              max={4}
              value={rooms}
              onChange={(e) => setRooms(Math.min(4, Math.max(1, Number(e.target.value))))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Assign room</Label>
            <select
              className={selectCls}
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            >
              <option value="">Assign later</option>
              {free.map((r) => (
                <option key={r} value={r}>
                  Room {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Source</Label>
            <select
              className={selectCls}
              value={source}
              onChange={(e) => setSource(e.target.value as Booking["source"])}
            >
              <option>Walk-in</option>
              <option>Phone</option>
              <option>Website</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Notes / requests</Label>
            <Textarea rows={2} value={requests} onChange={(e) => setRequests(e.target.value)} />
          </div>
        </div>
        {guests > cat.maxGuests * rooms && (
          <p className="mt-4 rounded-lg bg-warning-soft p-3 text-sm text-warning">
            {cat.name} fits {cat.maxGuests} guests per room.
          </p>
        )}
        {left < rooms && (
          <p className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-destructive">
            Not enough {cat.name}s free for these dates.
          </p>
        )}
      </Panel>
      <Panel title="Summary" delay={0.1} className="h-fit xl:sticky xl:top-24">
        <img src={cat.image} alt="" className="aspect-video w-full rounded-xl object-cover" />
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Stay</dt>
            <dd className="text-navy">
              {formatDate(checkIn, { day: "numeric", month: "short" })} →{" "}
              {formatDate(checkOut, { day: "numeric", month: "short" })}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {formatINR(cat.price)} × {q.nights} × {rooms}
            </dt>
            <dd className="text-navy">{formatINR(q.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="text-navy">{formatINR(q.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="font-display text-lg text-navy">Total</dt>
            <dd className="font-display text-2xl text-gold">{formatINR(q.total)}</dd>
          </div>
        </dl>
        <div className="mt-4 space-y-1.5">
          <Label>Amount collected now (₹)</Label>
          <Input
            type="number"
            min={0}
            value={paid || ""}
            onChange={(e) => setPaid(Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div className="mt-2 flex gap-2">
          {[0.3, 0.5, 1].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPaid(Math.round(q.total * p))}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-gold hover:text-navy"
            >
              {p === 1 ? "Full" : `${p * 100}%`}
            </button>
          ))}
        </div>
        {canCheckIn && (
          <label className="mt-4 flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              checked={checkInNow}
              onChange={(e) => setCheckInNow(e.target.checked)}
              className="size-4 accent-[var(--gold)]"
            />{" "}
            Check the guest in now{" "}
            {checkInNow && !roomNumber && (
              <span className="text-xs text-warning">(assign a room)</span>
            )}
          </label>
        )}
        <Button
          type="submit"
          variant="gold"
          size="xl"
          className="mt-5 w-full"
          disabled={!valid || busy}
        >
          {busy ? <Loader2 className="animate-spin" /> : <PlusCircle />}{" "}
          {busy ? "Creating…" : "Create reservation"}
        </Button>
      </Panel>
    </form>
  );
}
