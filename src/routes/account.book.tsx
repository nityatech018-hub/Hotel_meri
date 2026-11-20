import { createFileRoute } from "@tanstack/react-router";
import { BookingWidget } from "@/components/site/BookingWidget";
import { RoomCard } from "@/components/site/RoomCard";
import { formatDate } from "@/lib/hotel/pricing";
import { resolveStay, validateStaySearch } from "@/lib/hotel/search";
import { availableUnits, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/account/book")({
  validateSearch: validateStaySearch,
  component: GuestBook,
});

function GuestBook() {
  const search = Route.useSearch();
  const state = useHotelState();
  const stay = resolveStay(search);
  const list = stay.category
    ? state.categories.filter((c) => c.id === stay.category)
    : state.categories;
  const params = {
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    guests: stay.guests,
    rooms: stay.rooms,
  };
  return (
    <div className="space-y-8">
      <BookingWidget
        to="/account/book"
        initial={search}
        key={JSON.stringify(search)}
        className="bg-card lg:grid lg:grid-cols-3 lg:divide-x-0 2xl:flex 2xl:divide-x"
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-gold">Available rooms</p>
          <h2 className="font-display text-3xl text-navy">
            {formatDate(stay.checkIn)} — {formatDate(stay.checkOut)}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {stay.guests} guests · {stay.rooms} room{stay.rooms > 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {list.map((c, i) => (
          <RoomCard
            key={c.id}
            room={c}
            index={i}
            stay={params}
            left={availableUnits(state, c.id, stay.checkIn, stay.checkOut)}
          />
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Sample prices in INR, excluding {Math.round(state.settings.taxRate * 100)}% tax. Your
        details are pre-filled at checkout.
      </p>
    </div>
  );
}
