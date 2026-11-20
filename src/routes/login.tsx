import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ConciergeBell,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LogoMark } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_GUEST, DEMO_RECEPTION } from "@/lib/hotel/data";
import { IMG } from "@/lib/hotel/images";
import { login, register, useHotel } from "@/lib/hotel/store";
import type { Role } from "@/lib/hotel/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { role?: Role | undefined } => ({
    role: s["role"] === "reception" ? "reception" : s["role"] === "guest" ? "guest" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Login — Hotel Meri & Residency" },
      {
        name: "description",
        content:
          "Sign in to your guest account or the reception dashboard at Hotel Meri & Residency.",
      },
      { property: "og:title", content: "Login — Hotel Meri & Residency" },
      {
        property: "og:description",
        content: "Guest and reception sign-in for Hotel Meri & Residency.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const session = useHotel((s) => s.session);
  const [role, setRole] = useState<Role>(search.role ?? "guest");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setRole(search.role ?? "guest"), [search.role]);
  useEffect(() => setError(""), [role, mode]);

  const demo = role === "guest" ? DEMO_GUEST : DEMO_RECEPTION;
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: (i * 53) % 100,
        delay: (i % 9) * 0.5,
        dur: 5 + (i % 4),
        size: 2 + (i % 3),
      })),
    [],
  );

  function go(r: Role) {
    navigate({ to: r === "reception" ? "/reception" : "/account" });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setTimeout(() => {
      const res =
        mode === "register" && role === "guest"
          ? register({ email, password, name, phone })
          : login(email, password, role);
      setBusy(false);
      if (typeof res === "string") {
        setError(res);
        return;
      }
      toast.success(`Welcome, ${res.name.split(" ")[0]}!`);
      go(res.role);
    }, 650);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <motion.img
          key={role}
          src={role === "guest" ? IMG.suite : IMG.lobby}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.25, rotateY: role === "guest" ? -18 : 18 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          style={{ transformPerspective: 1400 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="pointer-events-none absolute inset-0">
          {particles.map((p, i) => (
            <span
              key={i}
              className="animate-rise absolute bottom-0 rounded-full bg-champagne"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
              }}
            />
          ))}
        </div>
        <div className="relative flex h-full flex-col justify-between p-12 text-navy-foreground">
          <Link to="/" className="flex items-center gap-2 text-sm text-champagne hover:text-gold">
            <ArrowLeft className="size-4" /> Back to website
          </Link>
          <div>
            <motion.div
              className="w-fit"
              style={{ transformPerspective: 800 }}
              initial={{ scale: 0.5, opacity: 0, rotateY: -360 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.2 }}
            >
              <LogoMark className="size-28" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                className="origin-bottom"
                style={{ transformPerspective: 1000 }}
                initial={{ opacity: 0, y: 20, rotateX: -70 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -12, rotateX: 70 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="mt-8 text-5xl leading-tight">
                  {role === "guest" ? (
                    <>
                      Your stay,{" "}
                      <em className="text-gold-gradient animate-shine">at your fingertips</em>
                    </>
                  ) : (
                    <>
                      The front desk,{" "}
                      <em className="text-gold-gradient animate-shine">beautifully organised</em>
                    </>
                  )}
                </h2>
                <p className="mt-4 max-w-md text-navy-foreground/70">
                  {role === "guest"
                    ? "Manage reservations, download invoices and reach reception — all from your guest lounge."
                    : "Bookings, check-ins, rooms, payments and reports in one royal dashboard."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex items-center justify-center overflow-hidden bg-ivory px-5 py-12">
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-champagne/30 blur-3xl" />
        <motion.div
          style={{ transformPerspective: 1400, transformOrigin: "100% 50%" }}
          initial={{ opacity: 0, y: 30, rotateY: -40 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="size-4" /> Website
            </Link>
            <LogoMark className="size-12" />
          </div>

          <p className="eyebrow ornament text-gold">Welcome back</p>
          <h1 className="mt-3 text-5xl text-navy">
            {mode === "register" ? "Create account" : "Sign in"}
          </h1>

          {session && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-accent/60 p-3 text-sm"
            >
              <span className="text-navy">
                Signed in as <b>{session.name}</b>
              </span>
              <Button size="sm" variant="navy" onClick={() => go(session.role)}>
                Open dashboard
              </Button>
            </motion.div>
          )}

          {/* Role switch */}
          <div className="relative mt-8 grid grid-cols-2 rounded-2xl border border-border bg-card p-1.5 shadow-card">
            {(
              [
                ["guest", "Guest Login", UserRound],
                ["reception", "Reception / Admin", ConciergeBell],
              ] as const
            ).map(([r, label, Icon]) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  if (r === "reception") setMode("login");
                }}
                className={cn(
                  "relative flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors",
                  role === r ? "text-champagne" : "text-muted-foreground hover:text-navy",
                )}
              >
                {role === r && (
                  <motion.span
                    layoutId="role-pill"
                    className="absolute inset-0 rounded-xl bg-navy shadow-lift"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative size-4" />
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <AnimatePresence initial={false}>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91"
                      className="h-11"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-navy"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-lg bg-danger-soft p-3 text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <Button
              type="submit"
              variant="gold"
              size="xl"
              className="animate-glow w-full"
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : mode === "register" ? (
                <UserPlus />
              ) : (
                <LogIn />
              )}
              {busy
                ? "Please wait…"
                : mode === "register"
                  ? "Create account"
                  : role === "guest"
                    ? "Guest sign in"
                    : "Reception sign in"}
            </Button>
          </form>

          {role === "guest" && (
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "login" ? "New to Hotel Meri? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="font-medium text-gold underline-offset-4 hover:underline"
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          )}

          <motion.div
            key={role}
            style={{ transformPerspective: 1000 }}
            initial={{ opacity: 0, rotateX: -90, y: 10 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 origin-top rounded-2xl border border-dashed border-gold/60 bg-card p-4"
          >
            <p className="flex items-center gap-2 text-xs font-medium tracking-wider text-gold uppercase">
              <KeyRound className="size-3.5" /> Demo credentials
            </p>
            <p className="mt-2 text-sm text-navy">{demo.email}</p>
            <p className="text-sm text-navy">
              Password: <b>{demo.password}</b>
            </p>
            <Button
              type="button"
              variant="outlineGold"
              size="sm"
              className="mt-3 rounded-full"
              onClick={() => {
                setMode("login");
                setEmail(demo.email);
                setPassword(demo.password);
              }}
            >
              Fill demo details
            </Button>
            <p className="mt-3 text-[0.7rem] text-muted-foreground">
              For demonstration only — this sign-in runs in your browser and is not real security.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
