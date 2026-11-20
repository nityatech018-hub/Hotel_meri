import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetDemoData, updateSettings, useHotelState } from "@/lib/hotel/store";
import type { HotelSettings } from "@/lib/hotel/types";

export const Route = createFileRoute("/reception/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const state = useHotelState();
  const [form, setForm] = useState<HotelSettings>(state.settings);
  const set = <K extends keyof HotelSettings>(k: K, v: HotelSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const fields: [keyof HotelSettings, string, string?][] = [
    ["hotelName", "Hotel name"],
    ["address", "Address"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["whatsapp", "WhatsApp number", "Country code + number, digits only"],
    ["checkInTime", "Check-in time"],
    ["checkOutTime", "Check-out time"],
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Panel
        title="Hotel details"
        subtitle="Shown on the website contact page, footer and invoices"
        className="xl:col-span-2"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateSettings(form);
            toast.success("Settings saved");
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {fields.map(([k, label, hint]) => (
            <div
              key={k}
              className={
                k === "address" || k === "hotelName" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"
              }
            >
              <Label>{label}</Label>
              <Input value={String(form[k])} onChange={(e) => set(k, e.target.value as never)} />
              {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </div>
          ))}
          <div className="space-y-1.5">
            <Label>Tax rate (%)</Label>
            <Input
              type="number"
              min={0}
              max={40}
              value={Math.round(form.taxRate * 100)}
              onChange={(e) => set("taxRate", Math.max(0, Number(e.target.value)) / 100)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="gold" size="xl">
              <Save /> Save settings
            </Button>
          </div>
        </form>
      </Panel>
      <Panel
        title="Demo data"
        subtitle="Everything is stored in this browser"
        delay={0.1}
        className="h-fit"
      >
        <p className="text-sm text-muted-foreground">
          Reset restores the sample rooms, prices, bookings and accounts. Changes you made will be
          lost.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="mt-4 w-full border-destructive/40 text-destructive hover:bg-danger-soft hover:text-destructive"
            >
              <RotateCcw /> Reset demo data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
              <AlertDialogDescription>
                All bookings, prices and settings return to the sample values, and you'll be signed
                out.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetDemoData();
                  toast.success("Demo data reset");
                }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Panel>
    </div>
  );
}
