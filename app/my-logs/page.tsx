"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { AuthGuard, ProtectedActionLink } from "@/components/protected-action";
import { useAuth } from "@/components/auth-provider";
import { backendEndpoint } from "@/lib/external-services";

type Log = { id:string; title:string; state:string; status:string; created_at:string; review_note:string|null };

function PrivateRecords() {
  const { session } = useAuth();
  const [logs,setLogs] = useState<Log[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    void (async () => {
      const endpoint = backendEndpoint("/v1/me/submissions");
      if (!endpoint) {
        toast.error("The Vaada backend URL is not configured.");
        return setLoading(false);
      }
      try {
        const response = await fetch(endpoint,{headers:{authorization:`Bearer ${session.access_token}`},signal:controller.signal});
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Could not load your private records.");
        setLogs((body.submissions as Log[]) ?? []);
      } catch (error) {
        if (!controller.signal.aborted) toast.error(error instanceof Error ? error.message : "Could not load your private records.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [session]);

  return <section className="logs-page"><div><p className="eyebrow">YOUR PRIVATE RECORDS</p><h1>My records.</h1><p>Only the signed-in account that submitted these sources can see these private receipts.</p></div><div className="logs-list">{loading&&<div className="record-empty">Loading secure receipts…</div>}{!loading&&!logs.length&&<div className="record-empty"><h2>No submissions from this account.</h2><p>When you send a promise or proof, its receipt and review decision will appear here.</p><ProtectedActionLink href="/submit">Record a promise →</ProtectedActionLink></div>}{logs.map(log=><article key={log.id}><div><span>{new Date(log.created_at).toLocaleDateString("en-IN")}</span><span className={`log-status ${log.status}`}>{log.status.replaceAll("_"," ")}</span></div><h2>{log.title}</h2><p>{log.state} · receipt {log.id.slice(0,8)}</p>{log.review_note&&<blockquote>{log.review_note}</blockquote>}</article>)}</div></section>;
}

export default function MyLogsPage() {
  return <main className="site-shell route-shell"><SiteHeader/><AuthGuard><PrivateRecords/></AuthGuard></main>;
}
