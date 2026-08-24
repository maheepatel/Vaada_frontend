"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-browser";
import { SiteHeader } from "../../components/site-header";
import { backendEndpoint } from "../../lib/external-services";

type Log = { id: string; title: string; status: string; created_at: string };

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [message, setMessage] = useState("Loading your submissions…");
  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();
      if (!supabase) return setMessage("Connect Supabase to load private submission receipts.");
      const { data } = await supabase.auth.getSession();
      if (!data.session) return setMessage("No anonymous submission identity exists on this device yet.");
      const endpoint = backendEndpoint("/v1/me/submissions");
      if (!endpoint) return setMessage("Connect the Vaada backend to load private receipts.");
      const response = await fetch(endpoint, { headers: { authorization: `Bearer ${data.session.access_token}` } });
      const body = await response.json();
      if (!response.ok) return setMessage(body.error ?? "Could not load submissions.");
      const rows = body.submissions as Log[];
      setLogs((rows ?? []) as Log[]); setMessage(rows?.length ? "" : "You have not submitted a promise from this device.");
    };
    void load();
  }, []);
  return <><SiteHeader /><main className="inner-page logs-page"><Link className="button mini-button" href="/submit">New submission</Link><p className="eyebrow">PRIVATE RECEIPTS</p><h1>My logs.</h1>{message && <p className="detail-summary">{message}</p>}<div className="logs-list">{logs.map((log) => <article key={log.id}><div><span>{new Date(log.created_at).toLocaleDateString("en-IN")}</span><strong>{log.title}</strong></div><span>{log.status.replace("_", " ")}</span></article>)}</div></main></>;
}
