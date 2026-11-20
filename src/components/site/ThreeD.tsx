import { AnimatePresence, motion, type PanInfo, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Locks page scrolling while a 3D overlay is open. */
function useBodyLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

/* ------------------------------------------------------------------ */
/* Flip card                                                           */
/* ------------------------------------------------------------------ */

/**
 * Card that flips over in 3D when clicked (or Enter/Space) to show its back.
 * The front decides the height; the back fills the same space.
 */
export function FlipCard({
  front,
  back,
  className,
  delay = 0,
  label,
}: {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  delay?: number;
  label: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      className={cn("perspective-[1400px]", className)}
      initial={{ opacity: 0, y: 60, rotateX: -40 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      <motion.button
        type="button"
        aria-pressed={flipped}
        aria-label={`${label} — ${flipped ? "show front" : "show details"}`}
        onClick={() => setFlipped((f) => !f)}
        className="relative grid h-full w-full cursor-pointer text-left transform-3d focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        animate={{ rotateY: flipped ? 180 : 0 }}
        whileHover={{ scale: 1.03, z: 30 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 110, damping: 15 }}
      >
        <div className="col-start-1 row-start-1 h-full backface-hidden">{front}</div>
        <div className="col-start-1 row-start-1 h-full rotate-y-180 backface-hidden">{back}</div>
      </motion.button>
    </motion.div>
  );
}

/** Small "tap to flip" hint with a spinning icon. */
export function FlipHint({
  text = "Tap to discover",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <span className={cn("eyebrow inline-flex items-center gap-2 !text-[0.6rem]", className)}>
      <RotateCw className="animate-spin-slow size-3.5" />
      {text}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 3D photo viewer                                                     */
/* ------------------------------------------------------------------ */

export interface Photo {
  src: string;
  title: string;
  tag?: string;
}

export interface OpenFrom {
  index: number;
  rect: DOMRect | null;
}

/** Records where a clicked element sits so the viewer can open out of it. */
export function openFrom(index: number, el: HTMLElement | null): OpenFrom {
  return { index, rect: el ? el.getBoundingClientRect() : null };
}

const slide: Variants = {
  enter: ({ dir, rect }: { dir: number; rect: DOMRect | null }) => {
    if (dir === 0 && rect && typeof window !== "undefined") {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      return {
        x: rect.left + rect.width / 2 - vw / 2,
        y: rect.top + rect.height / 2 - vh / 2,
        scale: Math.max(0.2, rect.width / Math.min(vw * 0.85, 1100)),
        rotateX: 35,
        rotateY: -25,
        opacity: 0.4,
      };
    }
    return { x: dir > 0 ? "45%" : "-45%", rotateY: dir > 0 ? -75 : 75, scale: 0.8, opacity: 0 };
  },
  center: {
    x: 0,
    y: 0,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: EASE },
  },
  exit: ({ dir }: { dir: number }) => ({
    x: dir > 0 ? "-45%" : "45%",
    rotateY: dir > 0 ? 75 : -75,
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.6, ease: EASE },
  }),
};

/**
 * Full-screen viewer: the photo flies out of the clicked tile in 3D, swings
 * like a carousel between photos and shows a cover-flow strip of thumbnails.
 */
export function Lightbox3D({
  photos,
  open,
  onClose,
}: {
  photos: Photo[];
  open: OpenFrom | null;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const isOpen = open !== null && photos.length > 0;
  useBodyLock(isOpen);

  useEffect(() => {
    if (!open) return;
    setIndex(open.index);
    setRect(open.rect);
    setDir(0);
  }, [open]);

  function go(next: number) {
    const n = photos.length;
    const target = ((next % n) + n) % n;
    if (target === index) return;
    setDir(next > index ? 1 : -1);
    setRect(null);
    setIndex(target);
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -80) go(index + 1);
    else if (info.offset.x > 80) go(index - 1);
  }

  const photo = photos[index];

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && photo && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={photo.title}
            className="fixed inset-0 z-[160] flex flex-col overflow-hidden bg-navy-deep/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.1 } }}
            onClick={onClose}
          >
            <div className="intro-rays pointer-events-none absolute top-1/2 left-1/2 size-[140vmax] -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-60" />

            <motion.button
              className="absolute top-5 right-5 z-10 grid size-11 place-items-center rounded-full border border-gold/40 text-champagne transition hover:bg-gold hover:text-gold-foreground"
              aria-label="Close"
              onClick={onClose}
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <X className="size-5" />
            </motion.button>
            <p className="absolute top-7 left-6 z-10 text-xs tracking-[0.3em] text-champagne/70 tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </p>

            {/* Stage */}
            <div className="relative flex flex-1 items-center justify-center px-4 pt-16 perspective-[1600px]">
              <AnimatePresence initial={true} custom={{ dir, rect }} mode="popLayout">
                <motion.figure
                  key={photo.src + index}
                  custom={{ dir, rect }}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={onDragEnd}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-5xl cursor-grab active:cursor-grabbing transform-3d"
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    draggable={false}
                    className="mx-auto max-h-[62vh] w-auto rounded-2xl object-contain shadow-lift ring-1 ring-gold/30 md:max-h-[68vh]"
                  />
                  <motion.figcaption
                    className="mt-5 text-center"
                    initial={{ opacity: 0, y: 20, rotateX: -60 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
                  >
                    <span className="font-display text-2xl text-navy-foreground md:text-3xl">
                      {photo.title}
                    </span>
                    {photo.tag && (
                      <span className="ml-3 text-xs tracking-widest text-gold uppercase">
                        {photo.tag}
                      </span>
                    )}
                  </motion.figcaption>
                </motion.figure>
              </AnimatePresence>

              <button
                className="absolute left-2 z-10 grid size-12 place-items-center rounded-full border border-gold/40 bg-navy/60 text-champagne transition hover:scale-110 hover:bg-gold hover:text-gold-foreground md:left-8"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  go(index - 1);
                }}
              >
                <ChevronLeft />
              </button>
              <button
                className="absolute right-2 z-10 grid size-12 place-items-center rounded-full border border-gold/40 bg-navy/60 text-champagne transition hover:scale-110 hover:bg-gold hover:text-gold-foreground md:right-8"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  go(index + 1);
                }}
              >
                <ChevronRight />
              </button>
            </div>

            {/* Cover-flow thumbnails */}
            <motion.div
              className="relative h-28 shrink-0 perspective-[900px] md:h-32"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((p, i) => {
                const d = i - index;
                if (Math.abs(d) > 4) return null;
                return (
                  <motion.button
                    key={p.src + i}
                    aria-label={`Show ${p.title}`}
                    onClick={() => go(i)}
                    className="absolute top-3 left-1/2 h-20 w-28 overflow-hidden rounded-lg ring-1 ring-gold/40 md:h-24 md:w-36"
                    animate={{
                      x: `calc(-50% + ${d * 88}px)`,
                      rotateY: d === 0 ? 0 : d > 0 ? -50 : 50,
                      z: d === 0 ? 40 : -Math.abs(d) * 60,
                      scale: d === 0 ? 1.05 : 0.85,
                      opacity: 1 - Math.abs(d) * 0.18,
                    }}
                    style={{ zIndex: 10 - Math.abs(d) }}
                    transition={{ type: "spring", stiffness: 160, damping: 20 }}
                  >
                    <img src={p.src} alt="" className="size-full object-cover" />
                    {d === 0 && <span className="absolute inset-0 rounded-lg ring-2 ring-gold" />}
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

/* ------------------------------------------------------------------ */
/* Book-style story pop-up                                             */
/* ------------------------------------------------------------------ */

export interface Story {
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  points: string[];
  note?: string;
}

/**
 * Opens like a book: the photo page tilts in and the text page swings open on
 * its spine, then its lines rise in one by one.
 */
export function StoryBook3D({
  story,
  onClose,
  action,
}: {
  story: Story | null;
  onClose: () => void;
  action?: ReactNode;
}) {
  useBodyLock(story !== null);
  useEffect(() => {
    if (!story) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [story, onClose]);

  return (
    <Portal>
      <AnimatePresence>
        {story && (
          <motion.div
            key="story"
            role="dialog"
            aria-modal="true"
            aria-label={story.title}
            className="fixed inset-0 z-[160] grid place-items-center overflow-y-auto bg-navy-deep/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.25 } }}
            onClick={onClose}
          >
            <div
              className="relative grid w-full max-w-5xl perspective-[2000px] md:grid-cols-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo page */}
              <motion.div
                className="relative h-56 origin-right overflow-hidden rounded-t-2xl md:h-auto md:min-h-[520px] md:rounded-l-2xl md:rounded-tr-none"
                initial={{ rotateY: 35, x: 120, opacity: 0, scale: 0.85 }}
                animate={{ rotateY: 0, x: 0, opacity: 1, scale: 1 }}
                exit={{ rotateY: 35, x: 120, opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <motion.img
                  src={story.image}
                  alt={story.title}
                  className="absolute inset-0 size-full object-cover"
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 2.4, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-hero-overlay" />
                <p className="eyebrow absolute bottom-5 left-6 text-champagne">{story.eyebrow}</p>
              </motion.div>

              {/* Text page swinging open on the spine */}
              <motion.div
                className="relative origin-top rounded-b-2xl bg-card p-8 shadow-lift transform-3d md:origin-left md:rounded-r-2xl md:rounded-bl-none md:p-12"
                initial={{ rotateY: -120, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -120, opacity: 0, transition: { duration: 0.5 } }}
                transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 hidden w-8 bg-linear-to-r from-navy/15 to-transparent md:block" />
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-border text-navy transition hover:rotate-90 hover:border-gold hover:text-gold"
                >
                  <X className="size-4" />
                </button>
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.9 } } }}
                >
                  {[
                    <p key="e" className="eyebrow text-gold">
                      {story.eyebrow}
                    </p>,
                    <h3 key="t" className="mt-3 font-display text-4xl text-navy md:text-5xl">
                      {story.title}
                    </h3>,
                    <span key="l" className="mt-5 block h-px w-24 bg-gold-gradient" />,
                    <p key="x" className="mt-5 leading-relaxed text-muted-foreground">
                      {story.text}
                    </p>,
                    ...story.points.map((pt) => (
                      <p key={pt} className="mt-3 flex items-center gap-3 text-sm text-navy">
                        <span className="text-gold">✦</span>
                        {pt}
                      </p>
                    )),
                    story.note ? (
                      <p key="n" className="mt-5 text-xs text-muted-foreground">
                        {story.note}
                      </p>
                    ) : null,
                    action ? (
                      <div key="a" className="mt-8">
                        {action}
                      </div>
                    ) : null,
                  ]
                    .filter(Boolean)
                    .map((el, i) => (
                      <motion.div
                        key={i}
                        variants={{
                          hidden: { opacity: 0, y: 24, rotateX: -50 },
                          show: {
                            opacity: 1,
                            y: 0,
                            rotateX: 0,
                            transition: { duration: 0.6, ease: EASE },
                          },
                        }}
                      >
                        {el}
                      </motion.div>
                    ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
