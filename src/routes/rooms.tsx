import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookingWidget } from "@/components/site/BookingWidget";
import { Marquee } from "@/components/site/Motion";
import { PageHero } from "@/components/site/PageHero";
import { RoomCard } from "@/components/site/RoomCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { IMG } from "@/lib/hotel/images";
import { formatDate } from "@/lib/hotel/pricing";
import { resolveStay, validateStaySearch } from "@/lib/hotel/search";
import { availableUnits, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/rooms")({
  validateSearch: validateStaySearch,
  head: () => ({
    meta: [
      { title: "Rooms & Suites — Hotel Meri & Residency" },
      {
        name: "description",
        content:
          "Deluxe, Premium, Executive, Family rooms and the Luxury Suite. Check availability and book online.",
      },
      { property: "og:title", content: "Rooms & Suites — Hotel Meri & Residency" },
      {
        property: "og:description",
        content: "Explore our rooms and suites and check live availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rooms,
});

function Rooms() {
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
    <SiteLayout>
      <PageHero
        image={IMG.suite}
        eyebrow="Rooms & Suites"
        title={
          <>
            Rest like <em className="text-gold">royalty</em>
          </>
        }
        subtitle="Five room categories, one standard of comfort. Choose your dates to see what's available."
      />
      {/* Search bar folds down out of the banner like a hinged panel */}
      <motion.div
        className="relative z-10 mx-auto -mt-10 max-w-7xl px-5 lg:px-8"
        style={{ transformPerspective: 1400, transformOrigin: "50% 0%" }}
        initial={{ opacity: 0, rotateX: -80 }}
        animate={{ opacity: 1, rotateX: 0 }}
        transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <BookingWidget initial={search} key={JSON.stringify(search)} />
      </motion.div>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow text-gold">Availability</p>
            <h2 className="mt-2 text-3xl text-navy">
              {formatDate(stay.checkIn)} — {formatDate(stay.checkOut)}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {stay.guests} guest{stay.guests > 1 ? "s" : ""} · {stay.rooms} room
            {stay.rooms > 1 ? "s" : ""} · {list.length} categor{list.length > 1 ? "ies" : "y"}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
        <p className="mt-10 text-center text-xs text-muted-foreground">
          All prices are sample demo rates in INR, excluding 12% tax.
        </p>
      </section>
      <Marquee
        items={[
          "Free Wi‑Fi",
          "Breakfast Options",
          "Butler Service",
          "Smart TVs",
          "Rain Showers",
          "City Views",
          "Free Cancellation 48h",
        ]}
      />
    </SiteLayout>
  );
}
