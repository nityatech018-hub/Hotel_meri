import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  BarChart3,
  BedDouble,
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { RequireRole } from "@/components/dashboard/RequireRole";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reception")({
  head: () => ({
    meta: [
      { title: "Reception Dashboard — Hotel Meri & Residency" },
      {
        name: "description",
        content: "Front-desk dashboard for bookings, rooms, check-ins, payments and reports.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Reception Dashboard — Hotel Meri & Residency" },
      { property: "og:description", content: "Hotel management dashboard for reception staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReceptionLayout,
});

const NAV: NavItem[] = [
  {
    to: "/reception",
    label: "Dashboard Overview",
    icon: LayoutDashboard,
    exact: true,
    link: (p) => <Link to="/reception" {...p} />,
  },
  {
    to: "/reception/bookings",
    label: "All Bookings",
    icon: ClipboardList,
    link: (p) => <Link to="/reception/bookings" {...p} />,
  },
  {
    to: "/reception/new",
    label: "New Booking",
    icon: PlusCircle,
    link: (p) => <Link to="/reception/new" {...p} />,
  },
  {
    to: "/reception/rooms",
    label: "Room Management",
    icon: BedDouble,
    link: (p) => <Link to="/reception/rooms" {...p} />,
  },
  {
    to: "/reception/check-in",
    label: "Check-In",
    icon: LogIn,
    link: (p) => <Link to="/reception/check-in" {...p} />,
  },
  {
    to: "/reception/check-out",
    label: "Check-Out",
    icon: LogOut,
    link: (p) => <Link to="/reception/check-out" {...p} />,
  },
  {
    to: "/reception/guests",
    label: "Guest Management",
    icon: Users,
    link: (p) => <Link to="/reception/guests" {...p} />,
  },
  {
    to: "/reception/payments",
    label: "Payment Records",
    icon: CreditCard,
    link: (p) => <Link to="/reception/payments" {...p} />,
  },
  {
    to: "/reception/calendar",
    label: "Booking Calendar",
    icon: CalendarDays,
    link: (p) => <Link to="/reception/calendar" {...p} />,
  },
  {
    to: "/reception/reports",
    label: "Reports",
    icon: BarChart3,
    link: (p) => <Link to="/reception/reports" {...p} />,
  },
  {
    to: "/reception/settings",
    label: "Settings",
    icon: Settings,
    link: (p) => <Link to="/reception/settings" {...p} />,
  },
];

function ReceptionLayout() {
  return (
    <RequireRole role="reception">
      <DashboardShell
        variant="reception"
        items={NAV}
        action={
          <Button asChild variant="gold" size="sm" className="hidden rounded-full md:inline-flex">
            <Link to="/reception/new">
              <PlusCircle /> Walk-in
            </Link>
          </Button>
        }
      >
        <Outlet />
      </DashboardShell>
    </RequireRole>
  );
}
