import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, Search, Users, BedDouble, Crown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addDays, todayISO } from "@/lib/hotel/pricing";
import { resolveStay, type StaySearch } from "@/lib/hotel/search";
import { useHotel } from "@/lib/hotel/store";
import type { CategoryId } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";

const field =
  "w-full bg-transparent text-sm font-medium text-navy outline-none [color-scheme:light] placeholder:text-muted-foreground";

function Cell({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Search;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl px-4 py-3 transition hover:bg-accent/60">
      <span className="eyebrow flex items-center gap-1.5 !text-[0.6rem] text-gold">
        <Icon className="size-3.5" /> {label}
      </span>
      {children}
    </label>
  );
}

export function BookingWidget({
  initial = {},
  className,
  to = "/rooms",
}: {
  initial?: StaySearch;
  className?: string;
  to?: "/rooms" | "/account/book";
}) {
  const navigate = useNavigate();
  const categories = useHotel((s) => s.categories);
  const start = resolveStay(initial);
  const [checkIn, setCheckIn] = useState(start.checkIn);
  const [checkOut, setCheckOut] = useState(start.checkOut);
  const [guests, setGuests] = useState(start.guests);
  const [rooms, setRooms] = useState(start.rooms);
  const [category, setCategory] = useState<CategoryId | "">(start.category ?? "");
  const today = todayISO();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      to,
      search: { checkIn, checkOut, guests, rooms, category: category || undefined },
    });
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "glass-light grid gap-1 rounded-2xl p-2 shadow-lift sm:grid-cols-2 lg:flex lg:items-stretch lg:divide-x lg:divide-border",
        className,
      )}
    >
      <Cell icon={CalendarDays} label="Check-in">
        <input
          type="date"
          className={field}
          value={checkIn}
          min={today}
          onChange={(e) => {
            setCheckIn(e.target.value);
            if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 1));
          }}
          required
        />
      </Cell>
      <Cell icon={CalendarDays} label="Check-out">
        <input
          type="date"
          className={field}
          value={checkOut}
          min={addDays(checkIn, 1)}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </Cell>
      <Cell icon={Users} label="Guests">
        <select
          className={field}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        >
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Guest" : "Guests"}
            </option>
          ))}
        </select>
      </Cell>
      <Cell icon={BedDouble} label="Rooms">
        <select className={field} value={rooms} onChange={(e) => setRooms(Number(e.target.value))}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Room" : "Rooms"}
            </option>
          ))}
        </select>
      </Cell>
      <Cell icon={Crown} label="Room category">
        <select
          className={field}
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId | "")}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Cell>
      <div className="flex items-center p-1 sm:col-span-2 lg:pl-2">
        <Button type="submit" variant="gold" size="xl" className="h-14 w-full rounded-xl lg:w-auto">
          <Search /> Search Availability
        </Button>
      </div>
    </form>
  );
}
