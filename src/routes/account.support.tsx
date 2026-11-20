import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, Loader2, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/hotel/pricing";
import { sendSupportMessage, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/account/support")({
  component: GuestSupport,
});

function GuestSupport() {
  const state = useHotelState();
  const email = state.session!.email;
  const msgs = state.messages.filter((m) => m.email === email);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const s = state.settings;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      sendSupportMessage(email, subject.trim(), message.trim());
      setSubject("");
      setMessage("");
      setBusy(false);
      toast.success("Message sent to reception");
    }, 600);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel
        title="Contact reception"
        subtitle="We usually reply within an hour"
        className="lg:col-span-2"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subj">Subject</Label>
            <Input
              id="subj"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Early check-in, airport pickup…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg">Message</Label>
            <Textarea
              id="msg"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
            />
          </div>
          <Button type="submit" variant="gold" size="xl" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Send />}{" "}
            {busy ? "Sending…" : "Send message"}
          </Button>
        </form>
        <div className="mt-8 border-t border-border pt-6">
          <p className="eyebrow text-gold">Your messages</p>
          {msgs.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No messages yet"
              text="Messages you send to reception appear here."
            />
          ) : (
            <ul className="mt-4 space-y-3">
              <AnimatePresence initial={false}>
                {msgs.map((m) => (
                  <motion.li
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: -12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="rounded-xl border border-border bg-secondary/40 p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <p className="font-medium text-navy">{m.subject}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{m.message}</p>
                    <p className="mt-2 text-xs text-success">Delivered to reception</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </Panel>
      <Panel title="Reach us directly" delay={0.1}>
        <div className="space-y-3">
          {[
            {
              icon: Phone,
              label: "Call reception",
              value: s.phone,
              href: `tel:${s.phone.replace(/\s/g, "")}`,
            },
            { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: "Chat with us",
              href: `https://wa.me/${s.whatsapp}`,
            },
          ].map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.icon === MessageCircle ? "_blank" : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 rounded-xl border border-border p-3 transition hover:border-gold"
            >
              <span className="grid size-10 place-items-center rounded-full bg-navy text-gold">
                <c.icon className="size-4" />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">{c.label}</span>
                <span className="text-sm font-medium text-navy">{c.value}</span>
              </span>
            </motion.a>
          ))}
        </div>
      </Panel>
    </div>
  );
}
