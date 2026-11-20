import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BedDouble, Check, Maximize2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatINR } from "@/lib/hotel/pricing";
import type { RoomCategory } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";
import { useTilt } from "./Motion";

export interface StayParams {
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

function Availability({ left }: { left: number }) {
  const label = left === 0 ? "Sold out" : left <= 2 ? `Only ${left} left` : `${left} available`;
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[0.7rem] font-medium tracking-wide backdrop-blur",
        left === 0
          ? "bg-destructive text-destructive-foreground"
          : left <= 2
            ? "bg-warning text-navy-foreground"
            : "bg-success text-navy-foreground",
      )}
    >
      {label}
    </span>
  );
}

export function RoomCard({
  room,
  left,
  stay,
  index = 0,
  bookTo = "/book",
}: {
  room: RoomCategory;
  left: number;
  stay: StayParams;
  index?: number;
  bookTo?: "/book";
}) {
  const tooSmall = stay.guests > room.maxGuests * stay.rooms;
  const disabled = left < stay.rooms || tooSmall;
  const tilt = useTilt(6);
  return (
    // Outer layer swings the card up out of the floor; inner layer tilts toward the mouse.
    <motion.div
      className="flex"
      style={{ transformPerspective: 1200, transformOrigin: "50% 100%" }}
      initial={{ opacity: 0, y: 80, scale: 0.94, rotateX: -38, rotateY: (index % 3) * 8 - 8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0, rotateY: 0 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: 1, delay: (index % 3) * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.article
        whileHover={{ y: -8 }}
        {...tilt}
        className="group flex w-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-shadow duration-500 hover:shadow-lift"
      >
        <div className="sheen relative aspect-[4/3] overflow-hidden">
          <img
            src={room.image}
            alt={room.name}
            loading="lazy"
            width={1280}
            height={896}
            className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="glass-navy eyebrow rounded-full px-3 py-1 !text-[0.6rem] text-champagne">
              {room.size}
            </span>
            <Availability left={left} />
          </div>
          <div className="absolute right-4 bottom-4 rounded-xl bg-navy/90 px-4 py-2 text-right backdrop-blur">
            <p className="font-display text-2xl leading-none text-champagne">
              {formatINR(room.price)}
            </p>
            <p className="mt-1 text-[0.65rem] tracking-wider text-navy-foreground/70 uppercase">
              per night · sample
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="eyebrow text-gold">{room.tagline}</p>
          <h3 className="mt-2 text-3xl text-navy">{room.name}</h3>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-gold" /> Up to {room.maxGuests}
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-4 text-gold" /> {room.bed}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="size-4 text-gold" /> {room.size}
            </span>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {room.amenities.slice(0, 4).map((a) => (
              <li
                key={a}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
              >
                {a}
              </li>
            ))}
          </ul>
          {tooSmall && (
            <p className="mt-3 text-xs text-warning">
              Fits {room.maxGuests} guests per room — add a room for {stay.guests} guests.
            </p>
          )}
          <div className="mt-auto flex gap-3 pt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-navy/20 text-xs tracking-[0.14em] uppercase"
                >
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="dialog-3d max-w-2xl overflow-hidden p-0">
                <img
                  src={room.image}
                  alt={room.name}
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="p-6">
                  <DialogHeader>
                    <p className="eyebrow text-gold">{room.tagline}</p>
                    <DialogTitle className="font-display text-3xl font-normal text-navy">
                      {room.name}
                    </DialogTitle>
                    <DialogDescription>{room.description}</DialogDescription>
                  </DialogHeader>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    {[
                      ["Guests", `Up to ${room.maxGuests}`],
                      ["Bed", room.bed],
                      ["Size", room.size],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-secondary p-3">
                        <p className="eyebrow !text-[0.6rem] text-gold">{k}</p>
                        <p className="mt-1 text-sm font-medium text-navy">{v}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="mt-5 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {room.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-2">
                        <Check className="size-4 text-gold" /> {a}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="font-display text-3xl text-navy">
                      {formatINR(room.price)}
                      <span className="ml-1 font-sans text-xs text-muted-foreground">
                        / night (sample)
                      </span>
                    </p>
                    <Button asChild variant="gold" size="xl" disabled={disabled}>
                      <Link to={bookTo} search={{ category: room.id, ...stay }}>
                        Book Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {disabled ? (
              <Button variant="navy" className="flex-1 rounded-full text-xs" disabled>
                {left < stay.rooms ? "Unavailable" : "Too many guests"}
              </Button>
            ) : (
              <Button asChild variant="navy" className="flex-1 rounded-full text-xs">
                <Link to={bookTo} search={{ category: room.id, ...stay }}>
                  Book Now
                </Link>
              </Button>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
