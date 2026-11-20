import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Car,
  Coffee,
  Dumbbell,
  Quote,
  Sparkles,
  Utensils,
  Waves,
  Wifi,
  Star,
} from "lucide-react";
import { BookingWidget } from "@/components/site/BookingWidget";
import { useIntroDone } from "@/components/site/introState";
import { Aurora, GoldSparks, Marquee, SplitText, useTilt } from "@/components/site/Motion";
import { FlipCard, FlipHint, StoryBook3D, type Story } from "@/components/site/ThreeD";
import { Counter, Reveal, SectionTitle } from "@/components/site/Reveal";
import { RoomCard } from "@/components/site/RoomCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { IMG } from "@/lib/hotel/images";
import { resolveStay } from "@/lib/hotel/search";
import { availableUnits, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hotel Meri & Residency — Your Comfort, Our Royal Tradition" },
      {
        name: "description",
        content:
          "Book luxury rooms and suites at Hotel Meri & Residency. Royal comfort, fine dining and heartfelt hospitality.",
      },
      { property: "og:title", content: "Hotel Meri & Residency — Royal Comfort & Hospitality" },
      {
        property: "og:description",
        content: "Book luxury rooms and suites with warm, royal hospitality.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const AMENITIES = [
  {
    icon: Utensils,
    title: "Fine Dining",
    text: "Royal Indian & global cuisine",
    more: "Chef's tasting menus, live tandoor counter and in-room dining around the clock.",
    hours: "7 am – 11 pm · sample timings",
  },
  {
    icon: Waves,
    title: "Rooftop Pool",
    text: "Sunset infinity views",
    more: "Heated infinity pool with cabanas, poolside snacks and lantern-lit evenings.",
    hours: "6 am – 9 pm · sample timings",
  },
  {
    icon: Sparkles,
    title: "Spa & Wellness",
    text: "Ayurvedic rituals",
    more: "Traditional massages, steam room and couple's suites with trained therapists.",
    hours: "9 am – 9 pm · by appointment",
  },
  {
    icon: Wifi,
    title: "High-speed Wi‑Fi",
    text: "Across the property",
    more: "Free fibre Wi‑Fi in every room, lobby and poolside — perfect for work trips.",
    hours: "Always on · complimentary",
  },
  {
    icon: Car,
    title: "Valet & Transfers",
    text: "Airport pickup on request",
    more: "Chauffeured airport and railway transfers plus secure valet parking.",
    hours: "24 hours · on request",
  },
  {
    icon: Dumbbell,
    title: "Fitness Studio",
    text: "Open 24 hours",
    more: "Cardio and strength equipment, yoga mats and towels ready whenever you are.",
    hours: "Open 24 hours",
  },
];

const STORIES: Story[] = [
  {
    image: IMG.dining,
    eyebrow: "Dining",
    title: "The Royal Table",
    text: "Candlelit dinners, slow-cooked heritage recipes and a curated wine list, served in our chandelier-lit dining hall.",
    points: [
      "Heritage thalis & chef's tasting menu",
      "Live tandoor and dessert counter",
      "Private dining for celebrations",
    ],
    note: "Menus and timings are sample details.",
  },
  {
    image: IMG.pool,
    eyebrow: "Leisure",
    title: "Sunset Rooftop",
    text: "Unwind by the infinity pool with cabanas, lanterns and endless skies — the best seat in the city at golden hour.",
    points: [
      "Heated infinity pool & cabanas",
      "Poolside mocktails and snacks",
      "Lantern-lit evening lounge",
    ],
    note: "Facilities and timings are sample details.",
  },
];

/** Photo card that tilts toward the mouse and opens its story like a book. */
function StoryCard({ story, index, onOpen }: { story: Story; index: number; onOpen: () => void }) {
  const tilt = useTilt(8);
  return (
    <Reveal
      delay={index * 0.15}
      variant={index === 0 ? "left" : "right"}
      className="perspective-[1200px]"
    >
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${story.title}`}
        {...tilt}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97, rotateX: 8 }}
        className="group relative block w-full overflow-hidden rounded-2xl text-left shadow-card transition-shadow duration-500 hover:shadow-lift"
      >
        <img
          src={story.image}
          alt={story.title}
          loading="lazy"
          width={1280}
          height={896}
          className="aspect-[4/3] w-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-navy-foreground">
          <p className="eyebrow text-champagne">{story.eyebrow}</p>
          <h3 className="mt-2 text-4xl transition-transform duration-500 group-hover:-translate-y-1">
            {story.title}
          </h3>
          <span className="mt-3 block h-px w-12 origin-left bg-gold-gradient transition-all duration-700 group-hover:w-32" />
          <span className="eyebrow mt-4 inline-flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 !text-[0.6rem] text-champagne transition group-hover:bg-gold group-hover:text-gold-foreground">
            <BookOpen className="size-3.5" /> Open the story
          </span>
        </div>
      </motion.button>
    </Reveal>
  );
}

function Home() {
  const state = useHotelState();
  const stay = resolveStay({});
  const featured = state.categories.filter((c) => ["deluxe", "executive", "suite"].includes(c.id));
  const ready = useIntroDone();
  const [story, setStory] = useState<Story | null>(null);
  const play = ready ? "show" : "hidden";
  const rise = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-navy">
        <motion.img
          src={IMG.exterior}
          alt="Hotel Meri & Residency at dusk"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.25 }}
          animate={ready ? { scale: [1.25, 1.02, 1.08] } : { scale: 1.25 }}
          transition={{ duration: 18, ease: "easeOut", times: [0, 0.35, 1] }}
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <Aurora />
        <GoldSparks count={22} />
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pt-32 pb-10 lg:px-8">
          <motion.p
            initial="hidden"
            animate={play}
            variants={rise}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="eyebrow ornament text-champagne"
          >
            <span className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  initial="hidden"
                  animate={play}
                  variants={{
                    hidden: { scale: 0, rotate: -180 },
                    show: { scale: 1, rotate: 0 },
                  }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 260, damping: 14 }}
                >
                  <Star className="size-3 fill-gold text-gold" />
                </motion.span>
              ))}
            </span>
            Luxury Hotel &amp; Residency
          </motion.p>
          <h1 className="mt-6 max-w-4xl text-6xl leading-[0.98] text-navy-foreground md:text-8xl">
            <span className="block min-h-[1em]">
              {ready && <SplitText text="Your Comfort," delay={0.3} stagger={0.12} />}
            </span>
            <motion.em
              className="text-gold-gradient animate-shine block"
              initial="hidden"
              animate={play}
              variants={{
                hidden: { opacity: 0, clipPath: "inset(0% 100% 0% 0%)", filter: "blur(10px)" },
                show: {
                  opacity: 1,
                  clipPath: "inset(0% -5% -20% 0%)",
                  filter: "blur(0px)",
                  transitionEnd: { filter: "none" },
                },
              }}
              transition={{ delay: 0.7, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            >
              Our Royal Tradition.
            </motion.em>
          </h1>
          <motion.p
            initial="hidden"
            animate={play}
            variants={rise}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-6 max-w-xl text-lg text-navy-foreground/80"
          >
            Experience exceptional hospitality, comfort and unforgettable stays.
          </motion.p>
          <motion.div
            initial="hidden"
            animate={play}
            variants={rise}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button asChild variant="gold" size="xl">
              <Link to="/book" search={{}}>
                Book Your Room
              </Link>
            </Button>
            <Button asChild variant="outlineLight" size="xl">
              <Link to="/about">Explore Hotel</Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial="hidden"
          animate={play}
          variants={{
            hidden: { opacity: 0, y: 80, scale: 0.95 },
            show: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ delay: 1.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-7xl px-5 pb-10 lg:px-8"
        >
          <BookingWidget />
        </motion.div>
      </section>

      <Marquee
        items={[
          "Royal Hospitality",
          "Luxury Suites",
          "Fine Dining",
          "Rooftop Pool",
          "Ayurvedic Spa",
          "24-Hour Concierge",
          "Airport Transfers",
        ]}
      />

      {/* Welcome */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
        <Reveal variant="left" className="relative">
          <Reveal variant="wipe">
            <img
              src={IMG.lobby}
              alt="Grand reception lobby"
              loading="lazy"
              width={1280}
              height={896}
              className="aspect-[4/5] w-4/5 rounded-2xl object-cover shadow-lift"
            />
          </Reveal>
          <motion.img
            initial={{ opacity: 0, y: 80, rotate: 8 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            src={IMG.lounge}
            alt="Lounge interior"
            loading="lazy"
            width={1024}
            height={1280}
            className="absolute right-0 -bottom-10 aspect-[3/4] w-2/5 rounded-2xl border-4 border-background object-cover shadow-lift"
          />
          <div className="animate-float absolute top-8 -right-2 hidden rounded-2xl bg-navy p-5 text-center shadow-lift md:block lg:right-6">
            <p className="font-display text-4xl text-gold">25+</p>
            <p className="eyebrow !text-[0.6rem] text-navy-foreground/70">Years of care</p>
          </div>
        </Reveal>
        <div>
          <SectionTitle
            align="left"
            eyebrow="Welcome"
            title={
              <>
                A royal welcome, <em className="text-gold">every single stay</em>
              </>
            }
            subtitle="Hotel Meri & Residency blends heritage elegance with modern comfort. From the moment you arrive, our team looks after every detail — so you can simply relax."
          />
          <Reveal delay={0.15} className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              [24, "+", "Elegant rooms"],
              [18000, "+", "Happy guests"],
              [4.8, "", "Guest rating"],
            ].map(([n, s, l]) => (
              <div key={l as string}>
                <p className="font-display text-4xl text-navy">
                  {n === 4.8 ? "4.8" : <Counter to={n as number} suffix={s as string} />}
                </p>
                <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">{l}</p>
              </div>
            ))}
          </Reveal>
          <Reveal delay={0.25} className="mt-10">
            <Button asChild variant="navy" size="xl">
              <Link to="/about">
                Our Story <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Rooms */}
      <section className="bg-secondary/60 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionTitle
            eyebrow="Rooms & Suites"
            title="Spaces made for rest"
            subtitle="From quiet Deluxe rooms to our royal Luxury Suite — each designed with comfort first. Prices shown are sample rates."
          />
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => (
              <RoomCard
                key={c.id}
                room={c}
                index={i}
                stay={stay}
                left={availableUnits(state, c.id, stay.checkIn, stay.checkOut)}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="xl" className="border-navy/30">
              <Link to="/rooms">
                View all rooms <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="relative overflow-hidden bg-navy-gradient py-24 text-navy-foreground lg:py-32">
        <Aurora />
        <GoldSparks count={12} />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <SectionTitle
            tone="light"
            eyebrow="Amenities"
            title="Every comfort, close at hand"
            subtitle="Tap any card to flip it and discover more."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AMENITIES.map((a, i) => (
              <FlipCard
                key={a.title}
                label={a.title}
                delay={i * 0.08}
                front={
                  <div className="group sheen flex h-full min-h-60 flex-col rounded-2xl border border-gold/25 bg-navy p-8 transition-colors duration-500 hover:bg-navy-soft">
                    <a.icon
                      className="size-9 text-gold transition-transform duration-700 group-hover:scale-125 group-hover:rotate-[360deg]"
                      strokeWidth={1.3}
                    />
                    <h3 className="mt-5 text-2xl">{a.title}</h3>
                    <p className="mt-2 text-sm text-navy-foreground/60">{a.text}</p>
                    <FlipHint className="mt-auto pt-6 text-gold" />
                  </div>
                }
                back={
                  <div className="flex h-full min-h-60 flex-col rounded-2xl bg-gold-gradient p-8 text-gold-foreground shadow-gold">
                    <a.icon className="size-7" strokeWidth={1.4} />
                    <p className="mt-4 font-display text-2xl">{a.title}</p>
                    <p className="mt-2 text-sm leading-relaxed">{a.more}</p>
                    <p className="eyebrow mt-auto pt-4 !text-[0.6rem]">{a.hours}</p>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Dining & leisure: open like a book */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-8 md:grid-cols-2">
          {STORIES.map((b, i) => (
            <StoryCard key={b.title} story={b} index={i} onOpen={() => setStory(b)} />
          ))}
        </div>
      </section>
      <StoryBook3D
        story={story}
        onClose={() => setStory(null)}
        action={
          <Button asChild variant="gold" size="xl">
            <Link to="/book" search={{}}>
              Plan your stay
            </Link>
          </Button>
        }
      />

      {/* Testimonial */}
      <section className="bg-secondary/60 py-24">
        <Reveal variant="zoom" className="mx-auto max-w-3xl px-5 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: false }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
          >
            <Quote className="mx-auto size-10 text-gold" strokeWidth={1.2} />
          </motion.div>
          <p className="mt-6 font-display text-3xl leading-snug text-navy italic md:text-4xl">
            “From the warm welcome at the desk to the flowers in our suite, every moment felt royal.
            We'll be back for our next anniversary.”
          </p>
          <p className="eyebrow mt-8 text-gold">Priya &amp; Rohan · Sample review</p>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy py-24 text-center text-navy-foreground">
        <motion.img
          src={IMG.suite}
          alt=""
          loading="lazy"
          initial={{ scale: 1.3 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <Aurora />
        <GoldSparks count={14} />
        <Reveal className="relative mx-auto max-w-2xl px-5">
          <Coffee className="animate-float mx-auto size-8 text-gold" strokeWidth={1.3} />
          <h2 className="mt-4 text-5xl md:text-6xl">
            <SplitText text="Your royal stay awaits" inView />
          </h2>
          <p className="mt-4 text-navy-foreground/70">
            Reserve in under a minute and receive your booking ID instantly.
          </p>
          <Button asChild variant="gold" size="xl" className="mt-8">
            <Link to="/book" search={{}}>
              Book Your Room
            </Link>
          </Button>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
