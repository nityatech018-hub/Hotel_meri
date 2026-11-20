import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Award, Expand, Eye, Gem, HeartHandshake, ShieldCheck, Target, Users } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Counter, Reveal, SectionTitle } from "@/components/site/Reveal";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useTilt } from "@/components/site/Motion";
import {
  FlipCard,
  FlipHint,
  Lightbox3D,
  openFrom,
  type OpenFrom,
  type Photo,
} from "@/components/site/ThreeD";
import { Button } from "@/components/ui/button";
import { IMG } from "@/lib/hotel/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Hotel Meri & Residency" },
      {
        name: "description",
        content:
          "Our story, mission and the hospitality that makes Hotel Meri & Residency feel like a royal home.",
      },
      { property: "og:title", content: "About Hotel Meri & Residency" },
      { property: "og:description", content: "Our story, mission and royal hospitality." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const WHY = [
  {
    icon: Gem,
    title: "Refined rooms",
    text: "Plush bedding, marble baths and thoughtful details in every category.",
    more: "Hand-picked linen, blackout drapes and pillow menus so every night is restful.",
  },
  {
    icon: HeartHandshake,
    title: "Heartfelt service",
    text: "A team that remembers your name, your tea and your preferences.",
    more: "Your preferences are noted on arrival, so every return stay feels like coming home.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & secure",
    text: "24×7 security, CCTV and contactless check-in options.",
    more: "Key-card floors, trained staff and in-room safes for complete peace of mind.",
  },
  {
    icon: Award,
    title: "Great value",
    text: "Premium comfort with transparent pricing and no surprises.",
    more: "Clear prices with taxes shown upfront and flexible stays for families and groups.",
  },
];

const PHOTOS: Photo[] = [
  { src: IMG.exterior, title: "The palace façade at dusk", tag: "Exterior" },
  { src: IMG.lounge, title: "The library lounge", tag: "Interiors" },
  { src: IMG.spa, title: "Spa treatment suite", tag: "Wellness" },
  { src: IMG.dining, title: "The Royal Table restaurant", tag: "Dining" },
];

/** Photo that tilts toward the mouse and opens the 3D viewer when clicked. */
function TiltPhoto({
  index,
  className,
  onOpen,
}: {
  index: number;
  className: string;
  onOpen: (o: OpenFrom) => void;
}) {
  const tilt = useTilt(10);
  const p = PHOTOS[index]!;
  return (
    <motion.button
      type="button"
      aria-label={`Open photo: ${p.title}`}
      onClick={(e) => onOpen(openFrom(index, e.currentTarget))}
      {...tilt}
      whileHover={{ scale: 1.03, z: 20 }}
      whileTap={{ scale: 0.96 }}
      className={`group relative block overflow-hidden rounded-2xl shadow-card ${className}`}
    >
      <img
        src={p.src}
        alt={p.title}
        loading="lazy"
        className="size-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
      />
      <span className="absolute inset-0 bg-hero-overlay opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <Expand className="absolute top-3 right-3 size-9 scale-50 rounded-full bg-navy/70 p-2 text-champagne opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100" />
    </motion.button>
  );
}

function About() {
  const [viewer, setViewer] = useState<OpenFrom | null>(null);
  return (
    <SiteLayout>
      <PageHero
        image={IMG.lobby}
        eyebrow="About us"
        title={
          <>
            Where heritage <em className="text-gold">meets home</em>
          </>
        }
        subtitle="A family-run luxury hotel built on one simple promise: every guest is treated like royalty."
      />

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionTitle
            align="left"
            eyebrow="Our story"
            title="Twenty-five years of royal hospitality"
          />
          <Reveal delay={0.1} className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Hotel Meri &amp; Residency began as a small family guesthouse with a big heart. Over
              the years it grew into a refined residency — yet the warmth that greeted our very
              first guests has never changed.
            </p>
            <p>
              Today, our arched façade, golden-lit lobby and carefully appointed rooms welcome
              travellers, families and business guests from across the country and the world.
            </p>
          </Reveal>
        </div>
        <Reveal variant="right" className="grid grid-cols-2 gap-4 perspective-[1200px]">
          <TiltPhoto index={0} className="col-span-2 aspect-[16/9]" onOpen={setViewer} />
          <TiltPhoto index={1} className="aspect-square" onOpen={setViewer} />
          <TiltPhoto index={2} className="aspect-square" onOpen={setViewer} />
        </Reveal>
      </section>

      <section className="bg-navy-gradient py-20 text-navy-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 text-center sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            [25, "+", "Years of service"],
            [24, "", "Rooms & suites"],
            [18000, "+", "Happy guests"],
            [98, "%", "Would return"],
          ].map(([n, s, l]) => (
            <Reveal key={l as string}>
              <p className="font-display text-6xl text-gold">
                <Counter to={n as number} suffix={s as string} />
              </p>
              <p className="eyebrow mt-2 text-navy-foreground/70">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-24 md:grid-cols-2 lg:px-8">
        {[
          {
            icon: Target,
            title: "Our mission",
            text: "To deliver graceful, personal hospitality that makes every guest feel cared for, rested and at home.",
          },
          {
            icon: Eye,
            title: "Our vision",
            text: "To be the most loved address for royal comfort in the region — known for warmth as much as luxury.",
          },
        ].map((b, i) => (
          <FlipCard
            key={b.title}
            label={b.title}
            delay={i * 0.12}
            front={
              <div className="gold-border flex h-full min-h-72 flex-col rounded-2xl p-10 shadow-card">
                <b.icon className="animate-float size-10 text-gold" strokeWidth={1.3} />
                <h3 className="mt-5 text-4xl text-navy">{b.title}</h3>
                <p className="mt-3 text-muted-foreground">Tap to reveal what drives us.</p>
                <FlipHint className="mt-auto pt-6 text-gold" text="Tap to flip" />
              </div>
            }
            back={
              <div className="flex h-full min-h-72 flex-col justify-center rounded-2xl bg-navy-gradient p-10 text-navy-foreground shadow-lift">
                <b.icon className="size-8 text-gold" strokeWidth={1.3} />
                <p className="eyebrow mt-5 text-gold">{b.title}</p>
                <p className="mt-3 font-display text-2xl leading-snug italic md:text-3xl">
                  {b.text}
                </p>
              </div>
            }
          />
        ))}
      </section>

      <section className="bg-secondary/60 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionTitle eyebrow="Why choose us" title="Why guests choose Hotel Meri & Residency" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <FlipCard
                key={w.title}
                label={w.title}
                delay={i * 0.08}
                front={
                  <div className="group flex h-full min-h-64 flex-col rounded-2xl bg-card p-8 shadow-card transition hover:shadow-lift">
                    <span className="grid size-14 place-items-center rounded-full bg-navy text-gold transition duration-700 group-hover:rotate-[360deg] group-hover:bg-gold group-hover:text-gold-foreground">
                      <w.icon className="size-6" strokeWidth={1.4} />
                    </span>
                    <h3 className="mt-6 text-2xl text-navy">{w.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
                    <FlipHint className="mt-auto pt-5 text-gold" />
                  </div>
                }
                back={
                  <div className="flex h-full min-h-64 flex-col rounded-2xl bg-gold-gradient p-8 text-gold-foreground shadow-gold">
                    <w.icon className="size-7" strokeWidth={1.4} />
                    <p className="mt-4 font-display text-2xl">{w.title}</p>
                    <p className="mt-2 text-sm leading-relaxed">{w.more}</p>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <Reveal variant="left" className="perspective-[1200px]">
          <TiltPhoto index={3} className="aspect-[4/3] w-full shadow-lift" onOpen={setViewer} />
        </Reveal>
        <div>
          <SectionTitle
            align="left"
            eyebrow="Hospitality highlights"
            title="Little touches, lasting memories"
          />
          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-4">
              {[
                "Welcome drink & cold towel on arrival",
                "Evening turndown with house sweets",
                "Celebration set-ups for birthdays & anniversaries",
                "Local experiences curated by our concierge",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 border-b border-border pb-4 text-navy"
                >
                  <Users className="size-4 text-gold" /> {t}
                </li>
              ))}
            </ul>
            <Button asChild variant="gold" size="xl" className="mt-8">
              <Link to="/book" search={{}}>
                Book your stay
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
      <Lightbox3D photos={PHOTOS} open={viewer} onClose={() => setViewer(null)} />
    </SiteLayout>
  );
}
