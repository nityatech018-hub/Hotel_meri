import { useRouterState } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Gold bar that sweeps across the top of the screen on every navigation. */
export function RouteProgress() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-0.5 origin-left bg-gold-gradient"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: [1, 1, 0] }}
        transition={{ duration: 0.9, ease: EASE, opacity: { times: [0, 0.7, 1], duration: 0.9 } }}
      />
    </AnimatePresence>
  );
}

/**
 * Fades each page in when you arrive on it. Opacity only: a transform here would
 * break the fixed navbar and intro overlay while the animation runs.
 */
export function PageTransition({ children, id }: { children: ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Thin gold reading-progress line under the navbar. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.3 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gold-gradient"
      style={{ scaleX }}
    />
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ y: -3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed right-6 bottom-24 z-40 grid size-11 place-items-center rounded-full border border-gold/50 bg-navy text-champagne shadow-lift"
        >
          <ArrowUp className="size-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: -45, transformPerspective: 1000 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Children wrapped in <StaggerItem> appear one after another. */
export function Stagger({
  children,
  className,
  inView = false,
}: {
  children: ReactNode;
  className?: string;
  inView?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      {...(inView
        ? { whileInView: "show", viewport: { once: false, margin: "-40px" } }
        : { animate: "show" })}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/** Endless gold ribbon of short phrases — used between sections. */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-gold/25 bg-navy-deep py-5">
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-12 font-display text-2xl text-navy-foreground/85 italic md:text-3xl"
          >
            {t}
            <span className="text-gold not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Navy curtain with the hotel crest that wipes away whenever you move to a new
 * page section (public page, guest area or reception area). Skipped on the
 * first load because the logo intro handles that.
 */
export function RouteCurtain({ section, logo }: { section: string; logo: string }) {
  const [wipe, setWipe] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setWipe((n) => n + 1);
  }, [section]);
  if (wipe === 0) return null;
  return (
    <motion.div
      key={wipe}
      className="pointer-events-none fixed inset-0 z-[150] grid place-items-center bg-navy-deep"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
    >
      <motion.img
        src={logo}
        alt=""
        className="size-20 rounded-full"
        initial={{ scale: 0.6, opacity: 0, rotate: -30 }}
        animate={{ scale: [0.6, 1, 0.9], opacity: [0, 1, 0], rotate: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <motion.span
        className="absolute inset-x-0 bottom-0 h-[3px] bg-gold-gradient"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      />
    </motion.div>
  );
}

/** Words rise one by one out of a mask. Pass plain text. */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.07,
  inView = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  inView?: boolean;
}) {
  const words = text.split(" ");
  const trigger = inView
    ? { whileInView: "show", viewport: { once: false, margin: "-40px" } }
    : { animate: "show" };
  return (
    <motion.span
      className={className}
      initial="hidden"
      {...trigger}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block origin-bottom"
            style={{ transformPerspective: 600 }}
            variants={{
              hidden: { y: "110%", rotate: 6, rotateX: -80, opacity: 0 },
              show: {
                y: "0%",
                rotate: 0,
                rotateX: 0,
                opacity: 1,
                transition: { duration: 0.85, ease: EASE },
              },
            }}
          >
            {w}
            {i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Rising gold sparks for dark backgrounds. */
export function GoldSparks({ count = 16 }: { count?: number }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 41) % 100,
        delay: (i % 7) * 0.6,
        dur: 6 + (i % 4),
        size: 2 + (i % 3),
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparks.map((p, i) => (
        <span
          key={i}
          className="animate-rise absolute bottom-0 rounded-full bg-champagne/80 shadow-gold"
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
  );
}

/** Slowly drifting gold/blue light behind a dark section. */
export function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="aurora-a absolute -top-1/4 -left-1/4 size-[70%] rounded-full" />
      <div className="aurora-b absolute -right-1/4 -bottom-1/4 size-[70%] rounded-full" />
    </div>
  );
}

/** Card that tilts in 3D toward the mouse and lifts on hover. */
export function useTilt(strength = 8) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 200, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 200, damping: 18 });
  function onMouseMove(e: MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-py * strength);
    ry.set(px * strength);
  }
  function onMouseLeave() {
    rx.set(0);
    ry.set(0);
  }
  return {
    style: { rotateX, rotateY, transformPerspective: 1000 },
    onMouseMove,
    onMouseLeave,
  };
}

/** Gold ring that trails the mouse on desktop and grows over links/buttons. */
export function CursorGlow() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 30, mass: 0.5 });
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHover(!!t?.closest("a,button,[role=button],input,select,textarea,label"));
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        className="cursor-ring pointer-events-none fixed top-0 left-0 z-[300] rounded-full"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: hover ? 56 : 32, height: hover ? 56 : 32, scale: down ? 0.8 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[300] size-1.5 rounded-full bg-gold"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
    </>
  );
}
