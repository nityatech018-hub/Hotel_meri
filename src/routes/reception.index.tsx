import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  DoorOpen,
  IndianRupee,
  LogIn,
  LogOut,
  ClipboardList,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState, Panel, StatCard, rowMotion, tooltipStyle } from "@/components/dashboard/ui";
import { StatusBadge } from "@/components/site/StatusBadge";
import { addDays, formatDate, formatINR, todayISO } from "@/lib/hotel/pricing";
import { revenueByDay } from "@/lib/hotel/reports";
import { getCategory, occupiedRoomNumbers, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/reception/")({
  component: Overview,
});

function Overview() {
  const state = useHotelState();
  const today = todayISO();
  const occ = occupiedRoomNumbers(state);
  const total = state.rooms.length;
  const outOfService = state.rooms.filter(
    (r) => r.status !== "available" && !occ.has(r.number),
  ).length;
  const available = total - occ.size - outOfService;
  const arrivals = state.bookings.filter(
    (b) => b.checkIn === today && (b.status === "Confirmed" || b.status === "Pending"),
  );
  const departures = state.bookings.filter(
    (b) => b.checkOut === today && b.status === "Checked-In",
  );
  const activeBookings = state.bookings.filter((b) => b.status !== "Cancelled").length;
  const month = today.slice(0, 7);
  const monthRevenue = revenueByDay(state.bookings, `${month}-01`, 31)
    .filter((d) => d.date.startsWith(month))
    .reduce((n, d) => n + d.revenue, 0);

  const trend = revenueByDay(state.bookings, addDays(today, -20), 21).map((d) => ({
    ...d,
    label: formatDate(d.date, { day: "numeric", month: "short" }),
  }));
  const byCat = state.categories.map((c) => {
    const rooms = state.rooms.filter((r) => r.categoryId === c.id);
    const o = rooms.filter((r) => occ.has(r.number)).length;
    return { name: c.name.replace(" Room", ""), occupied: o, free: rooms.length - o };
  });
  const sources = (["Website", "Walk-in", "Phone"] as const).map((s) => ({
    name: s,
    value: state.bookings.filter((b) => b.source === s).length,
  }));
  const COLORS = ["var(--gold)", "var(--navy)", "var(--chart-3)"];
  const recent = [...state.bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          index={0}
          icon={BedDouble}
          label="Total rooms"
          value={total}
          hint={`${outOfService} cleaning / maintenance`}
        />
        <StatCard
          index={1}
          icon={DoorOpen}
          label="Available rooms"
          value={available}
          tone="success"
          hint="Ready to assign now"
        />
        <StatCard
          index={2}
          icon={CalendarCheck}
          label="Occupied rooms"
          value={occ.size}
          tone="info"
          hint={`${Math.round((occ.size / total) * 100)}% occupancy`}
        />
        <StatCard
          index={3}
          icon={IndianRupee}
          label="Revenue this month"
          prefix="₹"
          value={monthRevenue}
          tone="gold"
          hint="Room revenue earned (sample)"
        />
        <StatCard
          index={4}
          icon={LogIn}
          label="Today's check-ins"
          value={arrivals.length}
          tone="warning"
        />
        <StatCard
          index={5}
          icon={LogOut}
          label="Today's check-outs"
          value={departures.length}
          tone="danger"
        />
        <StatCard
          index={6}
          icon={ClipboardList}
          label="Total bookings"
          value={activeBookings}
          hint={`${state.bookings.length - activeBookings} cancelled`}
        />
        <StatCard
          index={7}
          icon={IndianRupee}
          label="Outstanding balance"
          prefix="₹"
          value={state.bookings
            .filter((b) => b.status !== "Cancelled")
            .reduce((n, b) => n + Math.max(0, b.total - b.amountPaid), 0)}
          tone="navy"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Revenue overview"
          subtitle="Room revenue per night — last 3 weeks"
          className="xl:col-span-2"
          delay={0.2}
        >
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  width={48}
                />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [formatINR(v), "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--gold)"
                  strokeWidth={2.5}
                  fill="url(#rev)"
                  animationDuration={1400}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Booking sources" subtitle="All bookings" delay={0.3}>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={sources}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  animationDuration={1200}
                >
                  {sources.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} stroke="var(--card)" />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            {sources.map((s, i) => (
              <span key={s.name} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {s.name} · {s.value}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Occupancy by category" subtitle="Rooms in use right now" delay={0.35}>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byCat} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)" }} />
                <Bar
                  dataKey="occupied"
                  stackId="a"
                  fill="var(--navy)"
                  radius={[6, 0, 0, 6]}
                  animationDuration={1200}
                />
                <Bar
                  dataKey="free"
                  stackId="a"
                  fill="var(--champagne)"
                  radius={[0, 6, 6, 0]}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="Today's movements"
          delay={0.4}
          action={
            <Link
              to="/reception/check-in"
              className="flex items-center gap-1 text-sm text-gold hover:underline"
            >
              Front desk <ArrowRight className="size-4" />
            </Link>
          }
        >
          {arrivals.length + departures.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="A quiet day"
              text="No arrivals or departures today."
            />
          ) : (
            <ul className="space-y-2">
              {[
                ...arrivals.map((b) => ({ b, kind: "in" as const })),
                ...departures.map((b) => ({ b, kind: "out" as const })),
              ].map(({ b, kind }, i) => (
                <motion.li
                  key={b.id + kind}
                  {...rowMotion(i)}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <span
                    className={`grid size-9 place-items-center rounded-lg ${kind === "in" ? "bg-success-soft text-success" : "bg-danger-soft text-destructive"}`}
                  >
                    {kind === "in" ? <LogIn className="size-4" /> : <LogOut className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy">{b.guestName}</p>
                    <p className="text-xs text-muted-foreground">
                      {getCategory(state, b.categoryId).name}
                      {b.roomNumber ? ` · Room ${b.roomNumber}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </motion.li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel
          title="Recent bookings"
          delay={0.45}
          action={
            <Link
              to="/reception/bookings"
              className="flex items-center gap-1 text-sm text-gold hover:underline"
            >
              All <ArrowRight className="size-4" />
            </Link>
          }
        >
          <ul className="space-y-2">
            {recent.map((b, i) => (
              <motion.li
                key={b.id}
                {...rowMotion(i)}
                className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy">{b.guestName}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.id} · {formatDate(b.checkIn, { day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className="text-sm text-navy">{formatINR(b.total)}</span>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
