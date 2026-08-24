"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function LoginPage(){const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [busy,setBusy]=useState(false);const router=useRouter();const login=async(e:FormEvent)=>{e.preventDefault();const supabase=getBrowserSupabase();if(!supabase){toast.error("Authentication is not connected in this preview.");return;}setBusy(true);const {error}=await supabase.auth.signInWithPassword({email,password});setBusy(false);if(error){toast.error(error.message);return;}router.push("/review");};return <main className="site-shell route-shell"><SiteHeader/><section className="login-page"><form onSubmit={login}><p className="eyebrow">AUTHORIZED REVIEWERS</p><h1>Review with<br/>a clear trail.</h1><p>Reviewer decisions are attributed internally and added to an append-only audit log.</p><label>Email<input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)}/></label><button className="button button-primary" disabled={busy}>{busy?"Signing in…":"Reviewer login →"}</button></form></section></main>}
