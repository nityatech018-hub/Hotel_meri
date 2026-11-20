
import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { LOGO_URL } from "./Logo";
import { markIntroDone } from "./introState";

const EASE = [0.22, 1, 0.36, 1] as const;

const DURATION = 4200;
const NAME = "HOTEL MERI";

export function Intro() {
  const [show, setShow] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const remaining = Math.max(
      3400,
      DURATION - performance.now(),
    );

    const counter = animate(0, 100, {
      duration: (remaining - 400) / 1000,
      ease: "easeInOut",
      onUpdate: (value) => {
        setPct(Math.round(value));
      },
    });

    const timer = setTimeout(() => {
      setShow(false);
    }, remaining);

    return () => {
      counter.stop();
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (show) return;

    document.body.style.overflow = "";

    const timer = setTimeout(markIntroDone, 350);

    return () => clearTimeout(timer);
  }, [show]);

  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        left: (index * 37) % 100,
        size: 2 + ((index * 7) % 4),
        delay: (index % 12) * 0.2,
        duration: 3 + (index % 5),
      })),
    [],
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        left: (index * 53) % 100,
        top: (index * 29) % 100,
        delay: (index % 6) * 0.35,
      })),
    [],
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[200] overflow-hidden"
          exit={{
            transition: { duration: 1.1 },
          }}
          aria-label="Hotel Meri & Residency"
          role="dialog"
        >
          {/* Top curtain */}
          <motion.div
            className="bg-navy-deep absolute inset-x-0 top-0 h-1/2"
            exit={{ y: "-100%" }}
            transition={{
              duration: 1,
              ease: EASE,
              delay: 0.15,
            }}
          />

          {/* Bottom curtain */}
          <motion.div
            className="bg-navy-deep absolute inset-x-0 bottom-0 h-1/2"
            exit={{ y: "100%" }}
            transition={{
              duration: 1,
              ease: EASE,
              delay: 0.15,
            }}
          />

          {/* Golden center line */}
          <motion.div
            className="absolute inset-x-0 top-1/2 h-px bg-gold-gradient"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0, scaleY: 30 }}
            transition={{
              duration: 1.2,
              ease: EASE,
              delay: 0.1,
            }}
          />

          {/* Main content */}
          <motion.div
            className="absolute inset-0 grid place-items-center"
            exit={{
              opacity: 0,
              scale: 1.15,
              filter: "blur(8px)",
            }}
            transition={{ duration: 0.5 }}
          >
            {/* Rotating light rays */}
            <motion.div
              className="intro-rays absolute top-1/2 left-1/2 size-[160vmax] -translate-x-1/2 -translate-y-1/2"
              initial={{
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                opacity: 1,
                rotate: 60,
              }}
              transition={{
                opacity: { duration: 1.5 },
                rotate: {
                  duration: 6,
                  ease: "linear",
                },
              }}
            />

            <div className="intro-vignette absolute inset-0" />

            {/* Floating particles and stars */}
            <div className="pointer-events-none absolute inset-0">
              {particles.map((particle, index) => (
                <span
                  key={index}
                  className="animate-rise absolute bottom-0 rounded-full bg-champagne shadow-gold"
                  style={{
                    left: `${particle.left}%`,
                    width: particle.size,
                    height: particle.size,
                    animationDelay: `${particle.delay}s`,
                    animationDuration: `${particle.duration}s`,
                  }}
                />
              ))}

              {stars.map((star, index) => (
                <span
                  key={`star-${index}`}
                  className="animate-twinkle absolute text-champagne"
                  style={{
                    left: `${star.left}%`,
                    top: `${star.top}%`,
                    animationDelay: `${star.delay}s`,
                  }}
                >
                  ✦
                </span>
              ))}
            </div>

            {/* Logo and text */}
            <div className="relative flex flex-col items-center px-6 text-center">
              <div className="relative grid size-60 place-items-center md:size-72">
                {/* Pulsing golden halo */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gold/20 blur-3xl"
                  animate={{
                    scale: [0.8, 1.25, 0.95, 1.15],
                    opacity: [0, 0.9, 0.6, 0.85],
                  }}
                  transition={{
                    duration: 3.5,
                    ease: "easeInOut",
                  }}
                />

                {/* Golden ring */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 size-full -rotate-90"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="introGold"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--champagne)"
                      />
                      <stop
                        offset="50%"
                        stopColor="var(--gold)"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--champagne)"
                      />
                    </linearGradient>
                  </defs>

                  <motion.circle
                    cx="100"
                    cy="100"
                    r="96"
                    fill="none"
                    stroke="url(#introGold)"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 1.8,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  />

                  <motion.circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="url(#introGold)"
                    strokeWidth="0.6"
                    strokeDasharray="2 6"
                    initial={{
                      pathLength: 0,
                      opacity: 0,
                    }}
                    animate={{
                      pathLength: 1,
                      opacity: 0.8,
                    }}
                    transition={{
                      duration: 2.2,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                </svg>

                {/* Orbiting dots */}
                <motion.div
                  className="absolute -inset-6"
                  initial={{
                    rotate: 0,
                    opacity: 0,
                  }}
                  animate={{
                    rotate: 360,
                    opacity: 1,
                  }}
                  transition={{
                    rotate: {
                      duration: 4,
                      ease: "linear",
                    },
                    opacity: {
                      delay: 0.8,
                    },
                  }}
                >
                  <span className="absolute top-0 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-champagne shadow-gold" />

                  <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-gold" />
                </motion.div>

                {/* Outer circle */}
                <motion.div
                  className="absolute -inset-12 rounded-full border border-gold/20"
                  initial={{
                    scale: 0.6,
                    opacity: 0,
                  }}
                  animate={{
                    scale: [0.6, 1.05, 1],
                    opacity: [0, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.6,
                  }}
                />

                {/* Official logo animation */}
                <motion.div
                  className="relative size-48 overflow-hidden rounded-full md:size-56"
                  style={{
                    transformPerspective: 800,
                  }}
                  initial={{
                    scale: 0.2,
                    opacity: 0,
                    rotateY: 180,
                  }}
                  animate={{
                    scale: [0.2, 1.08, 1],
                    opacity: 1,
                    rotateY: 0,
                  }}
                  transition={{
                    duration: 1.4,
                    delay: 0.4,
                    ease: EASE,
                  }}
                >
                <img
  src="/favicon.png"
  alt="Hotel Meri & Residency"
  className="size-full object-contain"
/>

                  {/* Light sweep */}
                  <motion.span
                    className="intro-glint absolute inset-y-0 w-1/2"
                    initial={{ x: "-150%" }}
                    animate={{ x: "350%" }}
                    transition={{
                      duration: 1.1,
                      delay: 1.8,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>

              {/* Hotel name */}
              <h1 className="mt-10 flex overflow-hidden font-display text-4xl tracking-[0.22em] text-navy-foreground md:text-5xl">
                {NAME.split("").map((character, index) => (
                  <motion.span
                    key={index}
                    className="inline-block"
                    initial={{
                      y: "110%",
                      opacity: 0,
                      rotateX: -90,
                    }}
                    animate={{
                      y: "0%",
                      opacity: 1,
                      rotateX: 0,
                    }}
                    transition={{
                      duration: 0.7,
                      delay: 1.3 + index * 0.06,
                      ease: EASE,
                    }}
                  >
                    {character === " "
                      ? "\u00a0"
                      : character}
                  </motion.span>
                ))}
              </h1>

              {/* Residency text */}
              <motion.p
                className="eyebrow mt-3 text-gold-gradient animate-shine"
                initial={{
                  opacity: 0,
                  letterSpacing: "0.05em",
                }}
                animate={{
                  opacity: 1,
                  letterSpacing: "0.5em",
                }}
                transition={{
                  duration: 1.3,
                  delay: 2,
                }}
              >
                &amp; Residency
              </motion.p>

              {/* Tagline */}
              <motion.p
                className="mt-5 font-display text-xl italic text-navy-foreground/80 md:text-2xl"
                initial={{
                  opacity: 0,
                  y: 14,
                  filter: "blur(6px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 0.9,
                  delay: 2.4,
                }}
              >
                Experience Royal Comfort &amp; Hospitality
              </motion.p>

              {/* Loading progress */}
              <motion.div
                className="mt-10 w-56"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="h-px w-full overflow-hidden bg-navy-foreground/15">
                  <div
                    className="h-full origin-left bg-gold-gradient"
                    style={{
                      transform: `scaleX(${pct / 100})`,
                    }}
                  />
                </div>

                <p className="mt-3 text-[0.65rem] tabular-nums tracking-[0.4em] text-champagne/70">
                  {String(pct).padStart(3, "0")}%
                </p>
              </motion.div>
            </div>

            {/* Skip intro */}
            <button
              onClick={() => setShow(false)}
              className="absolute right-6 bottom-6 rounded-full border border-gold/40 px-5 py-2 text-xs tracking-[0.25em] text-champagne uppercase transition hover:bg-gold hover:text-gold-foreground"
            >
              Skip intro
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
