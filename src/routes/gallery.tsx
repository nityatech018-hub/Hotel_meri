import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Expand } from "lucide-react";
import { useState } from "react";
import { useTilt } from "@/components/site/Motion";
import { Lightbox3D, openFrom, type OpenFrom } from "@/components/site/ThreeD";
import { PageHero } from "@/components/site/PageHero";
import { SiteLayout } from "@/components/site/SiteLayout";
import { IMG } from "@/lib/hotel/images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Hotel Meri & Residency" },
      {
        name: "description",
        content: "Photos of our exterior, reception, rooms, interiors, dining and amenities.",
      },
      { property: "og:title", content: "Gallery — Hotel Meri & Residency" },
      { property: "og:description", content: "Take a visual tour of Hotel Meri & Residency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
});

const CATS = [
  "All",
  "Hotel Exterior",
  "Reception",
  "Deluxe Rooms",
  "Premium Rooms",
  "Interiors",
  "Dining",
  "Amenities",
] as const;
type Cat = (typeof CATS)[number];

const PHOTOS: { src: string; cat: Exclude<Cat, "All">; title: string; tall?: boolean }[] = [
  { src: IMG.exterior, cat: "Hotel Exterior", title: "The palace façade at dusk" },
  { src: IMG.lobby, cat: "Reception", title: "Golden reception lobby" },
  { src: IMG.deluxe, cat: "Deluxe Rooms", title: "Deluxe King room" },
  { src: IMG.lounge, cat: "Interiors", title: "The library lounge", tall: true },
  { src: IMG.premium, cat: "Premium Rooms", title: "Premium twin queens" },
  { src: IMG.dining, cat: "Dining", title: "The Royal Table restaurant" },
  { src: IMG.spa, cat: "Amenities", title: "Spa treatment suite", tall: true },
  { src: IMG.suite, cat: "Premium Rooms", title: "Luxury Suite salon" },
  { src: IMG.pool, cat: "Amenities", title: "Rooftop infinity pool" },
  { src: IMG.bath, cat: "Interiors", title: "Marble suite bathroom", tall: true },
  { src: IMG.executive, cat: "Deluxe Rooms", title: "Executive King room" },
  { src: IMG.family, cat: "Premium Rooms", title: "Family room" },
];

type GalleryPhoto = (typeof PHOTOS)[number];

/** Masonry tile: tilts in 3D toward the mouse and opens the 3D viewer. */
function GalleryTile({
  p,
  i,
  onOpen,
}: {
  p: GalleryPhoto;
  i: number;
  onOpen: (o: OpenFrom) => void;
}) {
  const tilt = useTilt(10);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, rotateY: -40 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      viewport={{ once: false, margin: "-40px" }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 40 }}
      transition={{ duration: 0.6, delay: (i % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="mb-5 break-inside-avoid perspective-[1200px]"
    >
      <motion.button
        type="button"
        aria-label={`Open photo: ${p.title}`}
        onClick={(e) => onOpen(openFrom(i, e.currentTarget))}
        {...tilt}
        whileHover={{ scale: 1.03, z: 30 }}
        whileTap={{ scale: 0.95 }}
        className="group relative block w-full overflow-hidden rounded-2xl shadow-card transition-shadow duration-500 hover:shadow-lift"
      >
        <img
          src={p.src}
          alt={p.title}
          loading="lazy"
          className={cn(
            "w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110",
            p.tall ? "aspect-[3/4]" : "aspect-[4/3]",
          )}
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-hero-overlay p-5 text-left opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <p className="eyebrow translate-y-4 !text-[0.6rem] text-champagne transition duration-500 group-hover:translate-y-0">
            {p.cat}
          </p>
          <p className="mt-1 translate-y-6 font-display text-2xl text-navy-foreground transition delay-75 duration-500 group-hover:translate-y-0">
            {p.title}
          </p>
        </div>
        <Expand className="absolute top-4 right-4 size-9 scale-50 rotate-90 rounded-full bg-navy/70 p-2 text-champagne opacity-0 transition duration-500 group-hover:scale-100 group-hover:rotate-0 group-hover:opacity-100" />
      </motion.button>
    </motion.div>
  );
}

function Gallery() {
  const [cat, setCat] = useState<Cat>("All");
  const [open, setOpen] = useState<OpenFrom | null>(null);
  const items = cat === "All" ? PHOTOS : PHOTOS.filter((p) => p.cat === cat);

  return (
    <SiteLayout>
      <PageHero
        image={IMG.lounge}
        eyebrow="Gallery"
        title={
          <>
            A glimpse of <em className="text-gold">the residency</em>
          </>
        }
      />
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-5 py-2 text-xs tracking-[0.14em] uppercase transition",
                cat === c
                  ? "border-navy bg-navy text-champagne"
                  : "border-border text-muted-foreground hover:border-gold hover:text-navy",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <motion.div layout className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          <p className="sr-only">Click any photo to open it in the 3D viewer.</p>
          <AnimatePresence mode="popLayout">
            {items.map((p, i) => (
              <GalleryTile key={p.src + p.title} p={p} i={i} onOpen={setOpen} />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <Lightbox3D
        photos={items.map((p) => ({ src: p.src, title: p.title, tag: p.cat }))}
        open={open}
        onClose={() => setOpen(null)}
      />
    </SiteLayout>
  );
}
