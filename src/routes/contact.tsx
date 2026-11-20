import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IMG } from "@/lib/hotel/images";
import { sendSupportMessage, useHotel } from "@/lib/hotel/store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Hotel Meri & Residency" },
      {
        name: "description",
        content:
          "Call, email, WhatsApp or write to Hotel Meri & Residency. We're here 24 hours a day.",
      },
      { property: "og:title", content: "Contact Hotel Meri & Residency" },
      { property: "og:description", content: "Reach our reception team any time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const settings = useHotel((s) => s.settings);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSending(true);
    setTimeout(() => {
      sendSupportMessage(
        String(f.get("email")),
        `Website enquiry from ${f.get("name")} (${f.get("phone")})`,
        String(f.get("message")),
      );
      setSending(false);
      setSent(true);
      toast.success("Message sent — our team will reply shortly.");
    }, 700);
  }

  const cards = [
    { icon: MapPin, label: "Address", value: settings.address },
    {
      icon: Phone,
      label: "Phone",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s/g, "")}`,
    },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    {
      icon: Clock,
      label: "Reception",
      value: `Open 24 hours · Check-in ${settings.checkInTime} · Check-out ${settings.checkOutTime}`,
    },
  ];

  return (
    <SiteLayout>
      <PageHero
        image={IMG.lobby}
        eyebrow="Contact"
        title={
          <>
            We'd love to <em className="text-gold">hear from you</em>
          </>
        }
        subtitle="Questions, special requests or group bookings — our reception team is here around the clock."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-5 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          {cards.map((c, i) => (
            <Reveal
              key={c.label}
              variant="flip"
              delay={i * 0.12}
              className="group flex gap-4 rounded-2xl bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-navy text-gold transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(360deg)]">
                <c.icon className="size-5" />
              </span>
              <div>
                <p className="eyebrow !text-[0.6rem] text-gold">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="mt-1 block text-navy hover:text-gold">
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1 text-navy">{c.value}</p>
                )}
              </div>
            </Reveal>
          ))}
          <Button
            asChild
            size="xl"
            className="w-full bg-success text-navy-foreground hover:bg-success/90"
          >
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle /> Chat on WhatsApp
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">
            Address, phone, email and WhatsApp are placeholders — update them in Reception →
            Settings.
          </p>
        </div>
        <Reveal
          variant="right"
          className="gold-border rounded-2xl p-8 shadow-card lg:col-span-3 md:p-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="sent"
                style={{ transformPerspective: 1400 }}
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-full flex-col items-center justify-center py-16 text-center"
              >
                <CheckCircle2 className="size-16 text-success" strokeWidth={1.3} />
                <h2 className="mt-5 text-4xl text-navy">Thank you!</h2>
                <p className="mt-2 text-muted-foreground">
                  Your message has reached our reception team.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                style={{ transformPerspective: 1400 }}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={submit}
                className="grid gap-5 sm:grid-cols-2"
              >
                <div className="sm:col-span-2">
                  <p className="eyebrow text-gold">Write to us</p>
                  <h2 className="mt-2 text-4xl text-navy">Send a message</h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" required placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="+91" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="How can we help?"
                  />
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  size="xl"
                  className="sm:col-span-2"
                  disabled={sending}
                >
                  <Send /> {sending ? "Sending…" : "Submit"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <Reveal
          variant="zoom"
          className="relative grid h-80 place-items-center overflow-hidden rounded-2xl bg-navy-gradient text-center text-navy-foreground perspective-[700px]"
        >
          {/* Gold grid laid flat like a city floor, gliding toward you */}
          <div className="map-floor absolute -inset-x-1/2 top-1/3 -bottom-1/2" />
          <div className="relative">
            <motion.div
              style={{ transformPerspective: 600 }}
              initial={{ y: -160, rotateY: 0, opacity: 0 }}
              whileInView={{ y: 0, rotateY: 720, opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            >
              <MapPin className="mx-auto size-10 animate-bounce text-gold" />
            </motion.div>
            <p className="mt-3 font-display text-3xl">Google Map goes here</p>
            <p className="mt-1 text-sm text-navy-foreground/60">
              Map embed placeholder — add your hotel's Google Maps link.
            </p>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
