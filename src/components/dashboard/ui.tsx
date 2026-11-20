import { animate, motion, useInView } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIntroDone } from "@/components/site/introState";
import { useTilt } from "@/components/site/Motion";

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.2,
}: {
  value: number;
  prefix?: string | undefined;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(from.current, value, { duration, ease: "easeOut", onUpdate: setV });
    from.current = value;
    return () => c.stop();
  }, [inView, value, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {Math.round(v).toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

const TONES = {
  navy: "bg-navy text-gold",
  gold: "bg-gold-gradient text-gold-foreground",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-destructive",
} as const;

export function StatCard({
  icon: Icon,
  label,
  value,
  prefix,
  hint,
  tone = "navy",
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix?: string;
  hint?: string;
  tone?: keyof typeof TONES;
  index?: number;
}) {
  const ready = useIntroDone();
  const tilt = useTilt(10);
  return (
    // Outer layer flips the card up in 3D; inner layer tilts toward the mouse.
    <motion.div
      style={{ transformPerspective: 1000, transformOrigin: "50% 100%" }}
      initial="hidden"
      animate={ready ? "show" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 40, rotateX: -60, scale: 0.92 },
        show: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
      }}
      transition={{ delay: index * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        whileHover={{ y: -6 }}
        {...tilt}
        className="group sheen h-full rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5 transition-shadow hover:shadow-lift"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {label}
          </p>
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[360deg]",
              TONES[tone],
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>
        <p className="mt-3 font-display text-2xl leading-none text-navy sm:text-4xl">
          <AnimatedNumber value={value} prefix={prefix} />
        </p>
        {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      </motion.div>
    </motion.div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  delay = 0,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ready = useIntroDone();
  return (
    <motion.section
      initial="hidden"
      animate={ready ? "show" : "hidden"}
      variants={{
        hidden: {
          opacity: 0,
          y: 40,
          scale: 0.98,
          rotateX: -18,
          transformPerspective: 1600,
          filter: "blur(6px)",
        },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          filter: "blur(0px)",
          transitionEnd: { filter: "none" },
        },
      }}
      transition={{ delay: delay + 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn("rounded-2xl border border-border bg-card shadow-card", className)}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title && <h2 className="font-display text-2xl text-navy">{title}</h2>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center px-6 py-14 text-center"
    >
      <motion.span
        style={{ transformPerspective: 600 }}
        animate={{ y: [0, -8, 0], rotateY: [0, 180, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="grid size-16 place-items-center rounded-full bg-accent text-gold"
      >
        <Icon className="size-7" />
      </motion.span>
      <p className="mt-4 font-display text-2xl text-navy">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

/** Row-by-row entrance for table bodies and lists. */
export const rowMotion = (i: number) => ({
  initial: { opacity: 0, y: 10, rotateX: -70, transformPerspective: 800 },
  animate: { opacity: 1, y: 0, rotateX: 0 },
  transition: { delay: Math.min(i, 12) * 0.03, duration: 0.45 },
});

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-full border border-input bg-card px-4 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25 sm:w-72"
    />
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition",
            value === o ? "text-champagne" : "text-muted-foreground hover:text-navy",
          )}
        >
          {value === o && (
            <motion.span
              layoutId={`chip-${id}`}
              className="absolute inset-0 rounded-full bg-navy"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

/** Navy-and-gold tooltip styling shared by all dashboard charts. */
export const tooltipStyle = {
  contentStyle: {
    background: "var(--navy)",
    border: "1px solid var(--gold)",
    borderRadius: 12,
    color: "var(--navy-foreground)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--champagne)" },
  itemStyle: { color: "var(--navy-foreground)" },
};
