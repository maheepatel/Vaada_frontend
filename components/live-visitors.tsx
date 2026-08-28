"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export function LiveVisitors() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const visitorId = crypto.randomUUID();
    const channel = supabase.channel("vaada-live-visitors", { config: { presence: { key: visitorId } } });
    channel
      .on("presence", { event: "sync" }, () => setCount(Object.keys(channel.presenceState()).length))
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ onlineAt: new Date().toISOString() });
      });
    return () => { void channel.untrack(); void supabase.removeChannel(channel); };
  }, []);

  return <span className="live-visitors" title={count === null ? "Live visitor count" : `${count} visitors viewing Vaada now`}><i aria-hidden="true" /><span>LIVE</span><strong>{count ?? "…"}</strong></span>;
}
