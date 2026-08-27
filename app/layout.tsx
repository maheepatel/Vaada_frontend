import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/500.css";
import { Toaster } from "sonner";
import { ScrollProgress } from "@/components/scroll-progress";
import { SmoothScroll } from "@/components/smooth-scroll";
import { AccountabilityBackdrop } from "@/components/accountability-backdrop";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaada | Public promises. Public proof.",
  description: "A source backed public register for tracking government promises in India.",
  icons: {
    icon: "/favicon.svg?v=coral-20260824",
    shortcut: "/favicon.svg?v=coral-20260824",
  },
};

export const viewport: Viewport = {
  themeColor: "#171717",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AuthProvider><SmoothScroll /><ScrollProgress /><AccountabilityBackdrop />{children}<Toaster position="bottom-center" richColors /></AuthProvider></body></html>;
}
