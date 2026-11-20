import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Sparkles, Wrench, BedDouble, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FilterChips, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatINR } from "@/lib/hotel/pricing";
import {
  getCategory,
  occupiedRoomNumbers,
  setRoomStatus,
  updateCategoryPrice,
  useHotelState,
} from "@/lib/hotel/store";
import type { CategoryId, RoomStatus } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reception/rooms")({
  component: RoomManagement,
});

const VIEW = ["All", "Available", "Occupied", "Cleaning", "Maintenance"] as const;
const STYLE = {
  available: {
    cls: "border-success/40 bg-success-soft text-success",
    icon: Check,
    label: "Available",
  },
  occupied: { cls: "border-info/40 bg-info-soft text-info", icon: UserRound, label: "Occupied" },
  cleaning: {
    cls: "border-warning/40 bg-warning-soft text-warning",
    icon: Sparkles,
    label: "Cleaning",
  },
  maintenance: {
    cls: "border-destructive/40 bg-danger-soft text-destructive",
    icon: Wrench,
    label: "Maintenance",
  },
};

function RoomManagement() {
  const state = useHotelState();
  const occ = occupiedRoomNumbers(state);
  const [view, setView] = useState<(typeof VIEW)[number]>("All");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const guestIn = (n: string) =>
    state.bookings.find((b) => b.status === "Checked-In" && b.roomNumber === n);
  const statusOf = (n: string, s: RoomStatus) => (occ.has(n) ? "occupied" : s);
  const floors = [...new Set(state.rooms.map((r) => r.floor))].sort();

  return (
    <div className="space-y-6">
      <Panel
        title="Room board"
        subtitle="Click a room to change its housekeeping status"
        action={<FilterChips options={VIEW} value={view} onChange={setView} />}
      >
        <div className="mb-5 flex flex-wrap gap-4 text-xs">
          {Object.entries(STYLE).map(([k, v]) => {
            const count = state.rooms.filter((r) => statusOf(r.number, r.status) === k).length;
            return (
              <span key={k} className="flex items-center gap-1.5 text-muted-foreground">
                <span className={cn("size-3 rounded border", v.cls)} />
                {v.label} · {count}
              </span>
            );
          })}
        </div>
        <div className="space-y-6">
          {floors.map((f) => {
            const rooms = state.rooms
              .filter((r) => r.floor === f)
              .filter((r) => view === "All" || STYLE[statusOf(r.number, r.status)].label === view);
            if (!rooms.length) return null;
            return (
              <div key={f}>
                <p className="eyebrow mb-3 text-gold">Floor {f}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
                  {rooms.map((r, i) => {
                    const st = statusOf(r.number, r.status);
                    const S = STYLE[st];
                    const g = guestIn(r.number);
                    return (
                      <Popover key={r.number}>
                        <PopoverTrigger asChild>
                          <motion.button
                            layout
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ y: -4, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={cn(
                              "rounded-xl border p-3 text-left shadow-card transition-shadow hover:shadow-lift",
                              S.cls,
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-display text-2xl">{r.number}</span>
                              <S.icon className="size-4" />
                            </div>
                            <p className="mt-1 truncate text-[0.7rem] opacity-80">
                              {getCategory(state, r.categoryId).name.replace(" Room", "")}
                            </p>
                            <p className="truncate text-[0.7rem] font-medium">
                              {g ? g.guestName : S.label}
                            </p>
                          </motion.button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2">
                          <p className="px-2 py-1 text-xs text-muted-foreground">
                            Room {r.number} — set status
                          </p>
                          {st === "occupied" ? (
                            <p className="px-2 py-2 text-sm text-navy">
                              Occupied by {g?.guestName}. Check the guest out to free this room.
                            </p>
                          ) : (
                            (["available", "cleaning", "maintenance"] as RoomStatus[]).map((s) => {
                              const I = STYLE[s].icon;
                              return (
                                <button
                                  key={s}
                                  onClick={() => {
                                    setRoomStatus(r.number, s);
                                    toast.success(`Room ${r.number}: ${STYLE[s].label}`);
                                  }}
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-accent",
                                    r.status === s && "bg-accent",
                                  )}
                                >
                                  <I className="size-4 text-gold" /> {STYLE[s].label}
                                </button>
                              );
                            })
                          )}
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel
        title="Room categories & sample prices"
        subtitle="Edit nightly rates — the website updates instantly"
        delay={0.15}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {state.categories.map((c, i) => {
            const count = state.rooms.filter((r) => r.categoryId === c.id).length;
            const val = prices[c.id] ?? String(c.price);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="sheen overflow-hidden rounded-xl border border-border"
              >
                <img src={c.image} alt="" className="aspect-video w-full object-cover" />
                <div className="p-4">
                  <p className="font-display text-xl text-navy">{c.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BedDouble className="size-3.5 text-gold" /> {count} rooms · up to {c.maxGuests}{" "}
                    guests
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Input
                      type="number"
                      min={500}
                      value={val}
                      onChange={(e) => setPrices((p) => ({ ...p, [c.id]: e.target.value }))}
                      className="h-9"
                    />
                    <Button
                      size="sm"
                      variant="navy"
                      disabled={Number(val) === c.price || Number(val) < 500}
                      onClick={() => {
                        updateCategoryPrice(c.id as CategoryId, Number(val));
                        toast.success(`${c.name} now ${formatINR(Number(val))}/night`);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
