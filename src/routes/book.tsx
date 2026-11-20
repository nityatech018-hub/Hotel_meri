import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTilt } from "@/components/site/Motion";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IMG } from "@/lib/hotel/images";
import { addDays, formatDate, formatINR, quoteStay, todayISO } from "@/lib/hotel/pricing";
import { resolveStay, validateStaySearch } from "@/lib/hotel/search";
import { availableUnits, createBooking, getCategory, useHotelState } from "@/lib/hotel/store";
import type { Booking, CategoryId } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book")({
  validateSearch: validateStaySearch,
  head: () => ({
    meta: [
      { title: "Book Your Room — Hotel Meri & Residency" },
      {
        name: "description",
        content: "Choose your room, dates and details, and confirm your stay in a few easy steps.",
      },
      { property: "og:title", content: "Book Your Room — Hotel Meri & Residency" },
      { property: "og:description", content: "Reserve your royal stay online in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

const STEPS = [
  { label: "Room", icon: BedDouble },
  { label: "Dates", icon: CalendarDays },
  { label: "Guest details", icon: UserRound },
  { label: "Review", icon: FileText },
];

function BookPage() {
  const search = Route.useSearch();
  const state = useHotelState();
  const init = resolveStay(search);
  const session = state.session;
  const user = session ? state.users.find((u) => u.email === session.email) : undefined;

  const [step, setStep] = useState(search.category ? 1 : 0);
  // Which way the page turns: forward steps flip left, going back flips right.
  const lastStep = useRef(step);
  const turn = step >= lastStep.current ? 1 : -1;
  useEffect(() => {
    lastStep.current = step;
  }, [step]);
  const summaryTilt = useTilt(6);
  const [categoryId, setCategoryId] = useState<CategoryId>(init.category ?? "deluxe");
  const [checkIn, setCheckIn] = useState(init.checkIn);
  const [checkOut, setCheckOut] = useState(init.checkOut);
  const [guests, setGuests] = useState(init.guests);
  const [rooms, setRooms] = useState(init.rooms);
  const [name, setName] = useState(session?.role === "guest" ? session.name : "");
  const [email, setEmail] = useState(session?.role === "guest" ? session.email : "");
  const [phone, setPhone] = useState(session?.role === "guest" ? (user?.phone ?? "") : "");
  const [requests, setRequests] = useState("");
  const [payMode, setPayMode] = useState<"advance" | "hotel">("advance");
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  const cat = getCategory(state, categoryId);
  const q = quoteStay(cat.price, checkIn, checkOut, rooms, state.settings.taxRate);
  const left = availableUnits(state, categoryId, checkIn, checkOut);
  const capacityOk = guests <= cat.maxGuests * rooms;
  const datesOk = checkIn >= todayISO() && checkOut > checkIn;
  const detailsOk =
    name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.replace(/\D/g, "").length >= 8;

  const canNext = [left >= rooms, datesOk && left >= rooms && capacityOk, detailsOk, true][step];

  function confirm() {
    setConfirming(true);
    setTimeout(() => {
      const advance = Math.round(q.total * 0.3);
      const b = createBooking({
        guestName: name,
        email,
        phone,
        categoryId,
        checkIn,
        checkOut,
        guests,
        rooms,
        requests,
        source: "Website",
        status: payMode === "advance" ? "Confirmed" : "Pending",
        payment: payMode === "advance" ? "Partial" : "Unpaid",
        amountPaid: payMode === "advance" ? advance : 0,
      });
      setConfirming(false);
      setDone(b);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1100);
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-navy pt-32 pb-24">
        <motion.img
          src={IMG.deluxe}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          initial={{ scale: 1.3, rotateX: 20, transformPerspective: 1200 }}
          animate={{ scale: 1, rotateX: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <div className="relative mx-auto max-w-5xl px-5 text-center perspective-[900px]">
          <motion.p
            className="eyebrow ornament justify-center text-champagne"
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Reservations
          </motion.p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1
              key={done ? "done" : "book"}
              className="mt-4 origin-bottom text-5xl text-navy-foreground md:text-6xl"
              initial={{ opacity: 0, rotateX: -80, y: 30 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: 80, y: -30 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {done ? "Your stay is booked" : "Book your royal stay"}
            </motion.h1>
          </AnimatePresence>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-5 pb-24">
        {done ? (
          <Confirmation booking={done} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <motion.div
              className="rounded-2xl bg-card p-6 shadow-lift md:p-8 lg:col-span-2"
              style={{ transformPerspective: 1600, transformOrigin: "50% 0%" }}
              initial={{ opacity: 0, rotateX: 35, y: 60 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              {/* Stepper */}
              <ol className="mb-8 grid grid-cols-4 gap-2">
                {STEPS.map((s, i) => (
                  <li key={s.label}>
                    <button
                      type="button"
                      disabled={i > step}
                      onClick={() => setStep(i)}
                      className="flex w-full flex-col items-center gap-2 text-center disabled:cursor-not-allowed"
                    >
                      <span
                        className={cn(
                          "grid size-10 place-items-center rounded-full border transition",
                          i < step
                            ? "border-gold bg-gold text-gold-foreground"
                            : i === step
                              ? "border-navy bg-navy text-champagne"
                              : "border-border text-muted-foreground",
                        )}
                      >
                        {i < step ? <Check className="size-4" /> : <s.icon className="size-4" />}
                      </span>
                      <span
                        className={cn(
                          "hidden text-xs tracking-wider uppercase sm:block",
                          i === step ? "text-navy" : "text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="page-turn-stage">
                <AnimatePresence mode="wait" custom={turn}>
                  <motion.div
                    key={step}
                    custom={turn}
                    variants={{
                      enter: (d: number) => ({ opacity: 0, rotateY: d * 70, x: d * 40 }),
                      center: { opacity: 1, rotateY: 0, x: 0 },
                      exit: (d: number) => ({ opacity: 0, rotateY: d * -70, x: d * -40 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{ transformOrigin: turn > 0 ? "0% 50%" : "100% 50%" }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 0 && (
                      <div>
                        <h2 className="text-3xl text-navy">1. Select your room</h2>
                        <div className="mt-6 grid gap-3">
                          {state.categories.map((c) => {
                            const l = availableUnits(state, c.id, checkIn, checkOut);
                            return (
                              <button
                                type="button"
                                key={c.id}
                                disabled={l === 0}
                                onClick={() => setCategoryId(c.id)}
                                className={cn(
                                  "flex items-center gap-4 rounded-xl border p-3 text-left transition disabled:opacity-50",
                                  categoryId === c.id
                                    ? "border-gold bg-accent/50 shadow-gold"
                                    : "border-border hover:border-gold/60",
                                )}
                              >
                                <img
                                  src={c.image}
                                  alt=""
                                  className="h-20 w-28 shrink-0 rounded-lg object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-display text-xl text-navy">{c.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {c.bed} · Up to {c.maxGuests} guests ·{" "}
                                    {l === 0 ? "Sold out" : `${l} available`}
                                  </p>
                                </div>
                                <p className="text-right font-display text-xl text-navy">
                                  {formatINR(c.price)}
                                  <span className="block font-sans text-[0.65rem] text-muted-foreground">
                                    / night
                                  </span>
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div>
                        <h2 className="text-3xl text-navy">2. Select your dates</h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Check-in</Label>
                            <Input
                              type="date"
                              min={todayISO()}
                              value={checkIn}
                              onChange={(e) => {
                                setCheckIn(e.target.value);
                                if (e.target.value >= checkOut)
                                  setCheckOut(addDays(e.target.value, 1));
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Check-out</Label>
                            <Input
                              type="date"
                              min={addDays(checkIn, 1)}
                              value={checkOut}
                              onChange={(e) => setCheckOut(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Guests</Label>
                            <Input
                              type="number"
                              min={1}
                              max={12}
                              value={guests}
                              onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rooms</Label>
                            <Input
                              type="number"
                              min={1}
                              max={4}
                              value={rooms}
                              onChange={(e) =>
                                setRooms(Math.min(4, Math.max(1, Number(e.target.value))))
                              }
                            />
                          </div>
                        </div>
                        {!capacityOk && (
                          <p className="mt-4 rounded-lg bg-warning-soft p-3 text-sm text-warning">
                            A {cat.name} fits {cat.maxGuests} guests — add another room for {guests}{" "}
                            guests.
                          </p>
                        )}
                        {left < rooms && (
                          <p className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-destructive">
                            Only {left} {cat.name}
                            {left === 1 ? "" : "s"} free on these dates. Try other dates or another
                            room.
                          </p>
                        )}
                        {capacityOk && left >= rooms && (
                          <p className="mt-4 rounded-lg bg-success-soft p-3 text-sm text-success">
                            Great news — available for {q.nights} night{q.nights > 1 ? "s" : ""}.
                          </p>
                        )}
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <h2 className="text-3xl text-navy">3. Guest details</h2>
                        {!session && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Have an account?{" "}
                            <Link
                              to="/login"
                              search={{ role: "guest" }}
                              className="text-gold underline"
                            >
                              Log in
                            </Link>{" "}
                            to track this booking in your dashboard.
                          </p>
                        )}
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Full name</Label>
                            <Input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="As on your ID"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Special requests (optional)</Label>
                            <Textarea
                              value={requests}
                              onChange={(e) => setRequests(e.target.value)}
                              placeholder="Early check-in, celebration set-up, dietary needs…"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div>
                        <h2 className="text-3xl text-navy">4. Review your booking</h2>
                        <dl className="mt-6 grid gap-4 rounded-xl bg-secondary/60 p-5 text-sm sm:grid-cols-2">
                          {[
                            ["Guest", name],
                            ["Contact", `${email} · ${phone}`],
                            ["Room", `${cat.name} × ${rooms}`],
                            ["Guests", String(guests)],
                            ["Check-in", `${formatDate(checkIn)} · ${state.settings.checkInTime}`],
                            [
                              "Check-out",
                              `${formatDate(checkOut)} · ${state.settings.checkOutTime}`,
                            ],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <dt className="eyebrow !text-[0.6rem] text-gold">{k}</dt>
                              <dd className="mt-1 text-navy">{v}</dd>
                            </div>
                          ))}
                          {requests && (
                            <div className="sm:col-span-2">
                              <dt className="eyebrow !text-[0.6rem] text-gold">Requests</dt>
                              <dd className="mt-1 text-navy">{requests}</dd>
                            </div>
                          )}
                        </dl>
                        <p className="mt-6 text-sm font-medium text-navy">
                          Payment option (demo — no real payment)
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {(
                            [
                              [
                                "advance",
                                "Pay 30% advance now",
                                `${formatINR(Math.round(q.total * 0.3))} today · booking confirmed instantly`,
                              ],
                              [
                                "hotel",
                                "Pay at hotel",
                                "Booking stays pending until reception confirms",
                              ],
                            ] as const
                          ).map(([v, t, d]) => (
                            <button
                              type="button"
                              key={v}
                              onClick={() => setPayMode(v)}
                              className={cn(
                                "rounded-xl border p-4 text-left transition",
                                payMode === v
                                  ? "border-gold bg-accent/50 shadow-gold"
                                  : "border-border hover:border-gold/60",
                              )}
                            >
                              <p className="font-medium text-navy">{t}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{d}</p>
                            </button>
                          ))}
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">
                          Free cancellation online up to 48 hours before check-in (demo rule).
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex justify-between gap-3 border-t border-border pt-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0 || confirming}
                >
                  <ArrowLeft /> Back
                </Button>
                {step < 3 ? (
                  <Button
                    variant="navy"
                    size="xl"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canNext}
                  >
                    Continue <ArrowRight />
                  </Button>
                ) : (
                  <Button variant="gold" size="xl" onClick={confirm} disabled={confirming}>
                    {confirming ? (
                      <>
                        <Loader2 className="animate-spin" /> Confirming…
                      </>
                    ) : (
                      <>
                        Confirm booking <Check />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Summary */}
            <motion.aside
              {...summaryTilt}
              className="h-fit overflow-hidden rounded-2xl bg-navy text-navy-foreground shadow-lift lg:sticky lg:top-24"
            >
              <div className="overflow-hidden perspective-[1000px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.img
                    key={cat.id}
                    src={cat.image}
                    alt={cat.name}
                    className="aspect-[16/10] w-full object-cover"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </AnimatePresence>
              </div>
              <div className="p-6">
                <p className="eyebrow text-gold">Booking summary</p>
                <h3 className="mt-2 text-3xl">{cat.name}</h3>
                <div className="mt-4 space-y-2 text-sm text-navy-foreground/75">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-gold" />{" "}
                    {formatDate(checkIn, { day: "numeric", month: "short" })} →{" "}
                    {formatDate(checkOut, { day: "numeric", month: "short" })} · {q.nights} night
                    {q.nights > 1 ? "s" : ""}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="size-4 text-gold" /> {guests} guest{guests > 1 ? "s" : ""} ·{" "}
                    {rooms} room{rooms > 1 ? "s" : ""}
                  </p>
                </div>
                <dl className="mt-6 space-y-2 border-t border-navy-foreground/15 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-navy-foreground/70">
                      {formatINR(cat.price)} × {q.nights} × {rooms}
                    </dt>
                    <dd>{formatINR(q.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-navy-foreground/70">
                      Taxes ({Math.round(state.settings.taxRate * 100)}%)
                    </dt>
                    <dd>{formatINR(q.tax)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-navy-foreground/15 pt-3 text-lg">
                    <dt className="font-display">Total</dt>
                    <dd className="font-display text-2xl text-gold">{formatINR(q.total)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[0.7rem] text-navy-foreground/50">
                  Sample prices for demonstration.
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function Confirmation({ booking }: { booking: Booking }) {
  const state = useHotelState();
  const cat = getCategory(state, booking.categoryId);
  return (
    // The confirmation swings around like a ticket being handed over.
    <motion.div
      style={{ transformPerspective: 1600 }}
      initial={{ opacity: 0, rotateY: -100, rotateX: 20, scale: 0.8 }}
      animate={{ opacity: 1, rotateY: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-card text-center shadow-lift"
    >
      <div className="h-1 bg-gold-gradient" />
      <div className="p-8 md:p-12">
        <motion.div
          style={{ transformPerspective: 600 }}
          initial={{ scale: 0, rotateY: -540 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ type: "spring", delay: 0.5, stiffness: 60, damping: 12 }}
        >
          <CheckCircle2 className="mx-auto size-20 text-success" strokeWidth={1.2} />
        </motion.div>
        <h2 className="mt-6 text-4xl text-navy">Thank you, {booking.guestName.split(" ")[0]}!</h2>
        <p className="mt-2 text-muted-foreground">
          Your reservation has been received. A demo confirmation is shown below.
        </p>
        <div className="mx-auto mt-8 flex max-w-sm items-center justify-between rounded-xl border border-dashed border-gold bg-accent/40 px-5 py-4">
          <div className="text-left">
            <p className="eyebrow !text-[0.6rem] text-gold">Booking ID</p>
            <p className="font-display text-3xl tracking-wider text-navy">{booking.id}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Copy booking ID"
            onClick={() => {
              navigator.clipboard?.writeText(booking.id);
              toast.success("Booking ID copied");
            }}
          >
            <Copy />
          </Button>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-4 text-left text-sm">
          <div>
            <dt className="text-muted-foreground">Room</dt>
            <dd className="text-navy">
              {cat.name} × {booking.rooms}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge status={booking.status} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Check-in</dt>
            <dd className="text-navy">{formatDate(booking.checkIn)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Check-out</dt>
            <dd className="text-navy">{formatDate(booking.checkOut)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total</dt>
            <dd className="text-navy">{formatINR(booking.total)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Paid</dt>
            <dd className="text-navy">{formatINR(booking.amountPaid)}</dd>
          </div>
        </dl>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild variant="navy" size="xl">
            <Link to="/invoice/$bookingId" params={{ bookingId: booking.id }}>
              View confirmation
            </Link>
          </Button>
          {state.session?.role === "guest" ? (
            <Button asChild variant="outline" size="xl">
              <Link to="/account/bookings">My bookings</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="xl">
              <Link to="/">Back to home</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
