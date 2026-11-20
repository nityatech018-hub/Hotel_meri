import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Phone, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, Panel, SearchInput, rowMotion } from "@/components/dashboard/ui";
import { StatusBadge } from "@/components/site/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatINR } from "@/lib/hotel/pricing";
import { getCategory, useHotelState } from "@/lib/hotel/store";
import type { Booking } from "@/lib/hotel/types";

export const Route = createFileRoute("/reception/guests")({
  component: Guests,
});

interface GuestRow {
  key: string;
  name: string;
  email: string;
  phone: string;
  bookings: Booking[];
  spent: number;
  last: string;
  inHouse: boolean;
}

function Guests() {
  const state = useHotelState();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<GuestRow | null>(null);
  const guests = useMemo(() => {
    const map = new Map<string, GuestRow>();
    for (const b of state.bookings) {
      const key = b.email;
      const g = map.get(key) ?? {
        key,
        name: b.guestName,
        email: b.email,
        phone: b.phone,
        bookings: [],
        spent: 0,
        last: b.checkIn,
        inHouse: false,
      };
      g.bookings.push(b);
      if (b.status !== "Cancelled") g.spent += b.amountPaid;
      if (b.checkIn > g.last) g.last = b.checkIn;
      if (b.status === "Checked-In") g.inHouse = true;
      map.set(key, g);
    }
    return [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
  }, [state.bookings]);
  const term = q.trim().toLowerCase();
  const list = guests.filter(
    (g) =>
      !term ||
      g.name.toLowerCase().includes(term) ||
      g.email.includes(term) ||
      g.phone.includes(term),
  );

  return (
    <>
      <Panel
        title="Guests"
        subtitle={`${guests.length} guest profiles · ${guests.filter((g) => g.inHouse).length} in house`}
        action={<SearchInput value={q} onChange={setQ} placeholder="Search name, email or phone" />}
      >
        {list.length === 0 ? (
          <EmptyState icon={SearchX} title="No guests found" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {list.map((g, i) => (
              <motion.button
                key={g.key}
                {...rowMotion(i)}
                whileHover={{ y: -3 }}
                onClick={() => setOpen(g)}
                className="flex items-center gap-4 rounded-xl border border-border p-4 text-left transition hover:border-gold hover:shadow-card"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-navy font-display text-lg text-gold">
                  {g.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-medium text-navy">
                    {g.name}
                    {g.inHouse && (
                      <span className="rounded-full bg-success-soft px-2 py-0.5 text-[0.65rem] text-success">
                        In house
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{g.phone}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.bookings.length} booking{g.bookings.length > 1 ? "s" : ""} ·{" "}
                    {formatINR(g.spent)}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </Panel>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl font-normal text-navy">
                  {open.name}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5 text-gold" /> {open.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5 text-gold" /> {open.email}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ["Bookings", open.bookings.length],
                  ["Total paid", formatINR(open.spent)],
                  ["Last stay", formatDate(open.last, { day: "numeric", month: "short" })],
                ].map(([k, v]) => (
                  <div key={k as string} className="rounded-xl bg-secondary p-3">
                    <p className="text-[0.65rem] tracking-wider text-gold uppercase">{k}</p>
                    <p className="mt-1 font-display text-xl text-navy">{v}</p>
                  </div>
                ))}
              </div>
              <ul className="max-h-72 space-y-2 overflow-y-auto">
                {open.bookings
                  .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
                  .map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
                    >
                      <div>
                        <p className="text-navy">{getCategory(state, b.categoryId).name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.id} · {formatDate(b.checkIn)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={b.status} />
                        <Link
                          to="/invoice/$bookingId"
                          params={{ bookingId: b.id }}
                          className="text-xs text-gold hover:underline"
                        >
                          Invoice
                        </Link>
                      </div>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
