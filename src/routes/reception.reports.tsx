import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, CalendarRange, IndianRupee, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FilterChips, Panel, StatCard, tooltipStyle } from "@/components/dashboard/ui";
import { addDays, formatDate, formatINR, todayISO } from "@/lib/hotel/pricing";
import { revenueByDay, roomsBookedOn } from "@/lib/hotel/reports";
import { useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/reception/reports")({
  component: Reports,
});

const RANGES = ["Daily", "Weekly", "Monthly"] as const;

function Reports() {
  const state = useHotelState();
  const today = todayISO();
  const [range, setRange] = useState<(typeof RANGES)[number]>("Daily");
  const span = range === "Daily" ? 14 : range === "Weekly" ? 12 * 7 : 90;
  const from = addDays(today, -(span - 1));
  const days = revenueByDay(state.bookings, from, span);
  const totalRooms = state.rooms.filter((r) => r.status !== "maintenance").length;

  type Point = { label: string; revenue: number; bookings: number; occupancy: number };
  let points: Point[];
  if (range === "Daily") {
    points = days.map((d) => ({
      label: formatDate(d.date, { day: "numeric", month: "short" }),
      revenue: d.revenue,
      bookings: d.bookings,
      occupancy: Math.round(
        (roomsBookedOn(
          state.bookings.map((b) =>
            b.status === "Checked-Out" ? { ...b, status: "Confirmed" as const } : b,
          ),
          d.date,
        ) /
          totalRooms) *
          100,
      ),
    }));
  } else {
    const groups = new Map<string, Point & { n: number }>();
    for (const d of days) {
      const key =
        range === "Weekly"
          ? addDays(from, Math.floor(days.indexOf(d) / 7) * 7)
          : d.date.slice(0, 7);
      const label =
        range === "Weekly"
          ? `Wk ${formatDate(key, { day: "numeric", month: "short" })}`
          : formatDate(`${key}-01`, { month: "short", year: "2-digit" });
      const g = groups.get(key) ?? { label, revenue: 0, bookings: 0, occupancy: 0, n: 0 };
      g.revenue += d.revenue;
      g.bookings += d.bookings;
      g.occupancy +=
        roomsBookedOn(
          state.bookings.map((b) =>
            b.status === "Checked-Out" ? { ...b, status: "Confirmed" as const } : b,
          ),
          d.date,
        ) / totalRooms;
      g.n++;
      groups.set(key, g);
    }
    points = [...groups.values()].map((g) => ({
      label: g.label,
      revenue: g.revenue,
      bookings: g.bookings,
      occupancy: Math.round((g.occupancy / g.n) * 100),
    }));
  }
  const revenue = points.reduce((n, p) => n + p.revenue, 0);
  const bookings = points.reduce((n, p) => n + p.bookings, 0);
  const occ = Math.round(points.reduce((n, p) => n + p.occupancy, 0) / Math.max(1, points.length));
  const byCat = state.categories.map((c) => ({
    name: c.name.replace(" Room", ""),
    revenue: revenueByDay(
      state.bookings.filter((b) => b.categoryId === c.id),
      from,
      span,
    ).reduce((n, d) => n + d.revenue, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <CalendarRange className="mr-1 inline size-4 text-gold" /> {formatDate(from)} —{" "}
          {formatDate(today)}
        </p>
        <FilterChips options={RANGES} value={range} onChange={setRange} />
      </div>
      <div key={range} className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          index={0}
          icon={IndianRupee}
          label="Room revenue"
          prefix="₹"
          value={revenue}
          tone="gold"
        />
        <StatCard index={1} icon={TrendingUp} label="New arrivals" value={bookings} tone="navy" />
        <StatCard
          index={2}
          icon={BedDouble}
          label="Avg occupancy"
          value={occ}
          hint="% of rooms in service"
          tone="info"
        />
        <StatCard
          index={3}
          icon={IndianRupee}
          label="Avg per day"
          prefix="₹"
          value={Math.round(revenue / span)}
          tone="success"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel key={"r" + range} title={`${range} revenue`} className="xl:col-span-2" delay={0.15}>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={points}>
                <defs>
                  <linearGradient id="goldBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--champagne)" />
                    <stop offset="100%" stopColor="var(--gold)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  width={52}
                />
                <Tooltip
                  {...tooltipStyle}
                  cursor={{ fill: "var(--accent)" }}
                  formatter={(v: number) => [formatINR(v), "Revenue"]}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#goldBar)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel key={"c" + range} title="Revenue by category" delay={0.25}>
          <ul className="space-y-4">
            {byCat
              .sort((a, b) => b.revenue - a.revenue)
              .map((c) => {
                const max = Math.max(...byCat.map((x) => x.revenue), 1);
                return (
                  <li key={c.name}>
                    <div className="flex justify-between text-sm">
                      <span className="text-navy">{c.name}</span>
                      <span className="text-muted-foreground">{formatINR(c.revenue)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gold-gradient transition-all duration-1000"
                        style={{ width: `${(c.revenue / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
          </ul>
        </Panel>
      </div>
      <Panel
        key={"o" + range}
        title="Occupancy & arrivals"
        subtitle="Occupancy % (navy) and new arrivals (gold)"
        delay={0.3}
      >
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone"
                dataKey="occupancy"
                name="Occupancy %"
                stroke="var(--navy)"
                strokeWidth={2.5}
                dot={false}
                animationDuration={1400}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                name="Arrivals"
                stroke="var(--gold)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--gold)" }}
                animationDuration={1400}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
