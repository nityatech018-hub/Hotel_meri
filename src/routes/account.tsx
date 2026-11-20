import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  BedDouble,
  CalendarCheck,
  CreditCard,
  History,
  LayoutDashboard,
  LifeBuoy,
  UserRound,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { RequireRole } from "@/components/dashboard/RequireRole";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Hotel Meri & Residency" },
      {
        name: "description",
        content: "Your guest dashboard: bookings, payments, invoices and support.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My Account — Hotel Meri & Residency" },
      { property: "og:description", content: "Manage your stays at Hotel Meri & Residency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountLayout,
});

const NAV: NavItem[] = [
  {
    to: "/account",
    label: "My Dashboard",
    icon: LayoutDashboard,
    exact: true,
    link: (p) => <Link to="/account" {...p} />,
  },
  {
    to: "/account/book",
    label: "Book a Room",
    icon: BedDouble,
    link: (p) => <Link to="/account/book" search={{}} {...p} />,
  },
  {
    to: "/account/bookings",
    label: "My Bookings",
    icon: CalendarCheck,
    link: (p) => <Link to="/account/bookings" {...p} />,
  },
  {
    to: "/account/history",
    label: "Booking History",
    icon: History,
    link: (p) => <Link to="/account/history" {...p} />,
  },
  {
    to: "/account/profile",
    label: "My Profile",
    icon: UserRound,
    link: (p) => <Link to="/account/profile" {...p} />,
  },
  {
    to: "/account/payments",
    label: "Payments",
    icon: CreditCard,
    link: (p) => <Link to="/account/payments" {...p} />,
  },
  {
    to: "/account/support",
    label: "Support",
    icon: LifeBuoy,
    link: (p) => <Link to="/account/support" {...p} />,
  },
];

function AccountLayout() {
  return (
    <RequireRole role="guest">
      <DashboardShell
        variant="guest"
        items={NAV}
        action={
          <Button asChild variant="gold" size="sm" className="hidden rounded-full md:inline-flex">
            <Link to="/account/book" search={{}}>
              <BedDouble /> Book a room
            </Link>
          </Button>
        }
      >
        <Outlet />
      </DashboardShell>
    </RequireRole>
  );
}
