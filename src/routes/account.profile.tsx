import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Loader2, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, useHotelState } from "@/lib/hotel/store";

export const Route = createFileRoute("/account/profile")({
  component: GuestProfile,
});

function GuestProfile() {
  const state = useHotelState();
  const user = state.users.find((u) => u.email === state.session!.email)!;
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city ?? "");
  const [saving, setSaving] = useState(false);
  const stays = state.bookings.filter(
    (b) => b.email === user.email && b.status === "Checked-Out",
  ).length;
  const dirty = name !== user.name || phone !== user.phone || city !== (user.city ?? "");

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      updateProfile(user.email, { name: name.trim(), phone: phone.trim(), city: city.trim() });
      setSaving(false);
      toast.success("Profile updated");
    }, 500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-border bg-card text-center shadow-card"
      >
        <div className="h-24 bg-navy-gradient" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mx-auto -mt-12 grid size-24 place-items-center rounded-full border-4 border-card bg-gold-gradient font-display text-4xl text-gold-foreground shadow-gold"
        >
          {user.name.slice(0, 1)}
        </motion.div>
        <div className="p-6">
          <p className="font-display text-2xl text-navy">{user.name}</p>
          <p className="text-sm text-muted-foreground">
            Royal member · {stays} completed stay{stays === 1 ? "" : "s"}
          </p>
          <ul className="mt-5 space-y-2 text-left text-sm">
            <li className="flex items-center gap-2 text-navy">
              <Mail className="size-4 text-gold" /> {user.email}
            </li>
            <li className="flex items-center gap-2 text-navy">
              <Phone className="size-4 text-gold" /> {user.phone || "—"}
            </li>
            <li className="flex items-center gap-2 text-navy">
              <MapPin className="size-4 text-gold" /> {user.city || "—"}
            </li>
          </ul>
        </div>
      </motion.div>
      <Panel
        title="Edit profile"
        subtitle="These details pre-fill your next booking"
        className="lg:col-span-2"
        delay={0.1}
      >
        <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pname">
              <UserRound className="mr-1 inline size-3.5 text-gold" />
              Full name
            </Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pphone">Phone</Label>
            <Input
              id="pphone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pcity">City</Label>
            <Input id="pcity" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input value={user.email} disabled />
            <p className="text-xs text-muted-foreground">
              Email is your sign-in and can't be changed in this demo.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="gold" size="xl" disabled={!dirty || saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Check />}{" "}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
