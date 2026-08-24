"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085, smoothWheel: true });
    return () => lenis.destroy();
  }, []);

  return null;
}
