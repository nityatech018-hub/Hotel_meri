import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useIntroDone } from "./introState";
import { Aurora, GoldSparks, SplitText } from "./Motion";

export function PageHero({
  image,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  image: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  // As you scroll away, the photo leans back and the text tips over like a page.
  const photoTilt = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const textTilt = useTransform(scrollYProgress, [0, 1], [0, 38]);
  const textDepth = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const ready = useIntroDone();
  const play = ready ? "show" : "hidden";

  return (
    <section ref={ref} className="relative flex min-h-[62vh] items-end overflow-hidden bg-navy">
      <motion.div
        className="absolute inset-0"
        style={{ y, rotateX: photoTilt, transformPerspective: 1400, transformOrigin: "50% 0%" }}
      >
        <motion.img
          src={image}
          alt=""
          className="h-[115%] w-full object-cover"
          initial={{ scale: 1.25, rotateY: -8, transformPerspective: 1400 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        />
      </motion.div>
      <div className="absolute inset-0 bg-hero-overlay" />
      <Aurora />
      <GoldSparks count={18} />
      <motion.div
        style={{
          opacity: fade,
          rotateX: textTilt,
          z: textDepth,
          transformPerspective: 1000,
          transformOrigin: "50% 100%",
        }}
        className="relative mx-auto w-full max-w-7xl px-5 pt-36 pb-16 lg:px-8"
      >
        <motion.p
          initial="hidden"
          animate={play}
          variants={{
            hidden: {
              opacity: 0,
              x: -30,
              rotateY: 60,
              transformPerspective: 800,
              letterSpacing: "0.1em",
            },
            show: { opacity: 1, x: 0, rotateY: 0, letterSpacing: "0.32em" },
          }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="eyebrow ornament text-champagne"
        >
          {eyebrow}
        </motion.p>
        {typeof title === "string" ? (
          <h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] text-navy-foreground md:text-7xl">
            {ready && <SplitText text={title} delay={0.3} />}
          </h1>
        ) : (
          <motion.h1
            initial="hidden"
            animate={play}
            variants={{
              hidden: {
                opacity: 0,
                y: 50,
                rotateX: -70,
                transformPerspective: 900,
                filter: "blur(12px)",
                clipPath: "inset(0% 0% 100% 0%)",
              },
              show: {
                opacity: 1,
                y: 0,
                rotateX: 0,
                filter: "blur(0px)",
                clipPath: "inset(0% 0% -20% 0%)",
                transitionEnd: { clipPath: "none" },
              },
            }}
            transition={{ delay: 0.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-3xl text-5xl leading-[1.05] text-navy-foreground md:text-7xl"
          >
            {title}
          </motion.h1>
        )}
        <motion.div
          initial="hidden"
          animate={play}
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1 } }}
          transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 h-px w-40 origin-left bg-gold-gradient"
        />
        {subtitle && (
          <motion.p
            initial="hidden"
            animate={play}
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
            }}
            transition={{ delay: 0.8, duration: 0.9 }}
            className="mt-5 max-w-xl text-base text-navy-foreground/75 md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
        {children}
      </motion.div>
      <motion.div
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-champagne/70 md:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="size-5" />
      </motion.div>
    </section>
  );
}
