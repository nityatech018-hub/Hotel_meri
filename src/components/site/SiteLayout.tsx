import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useHotel } from "@/lib/hotel/store";
import { BackToTop, ScrollProgress } from "./Motion";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export function SiteLayout({ children }: { children: ReactNode }) {
  const whatsapp = useHotel((s) => s.settings.whatsapp);
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <SiteNav />
      <main className="flex-1 overflow-x-clip">{children}</main>
      <SiteFooter />
      <BackToTop />
      <motion.a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="animate-pulse-ring fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-success text-navy-foreground shadow-lift"
      >
        <MessageCircle className="size-6" />
      </motion.a>
    </div>
  );
}
