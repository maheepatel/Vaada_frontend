"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Commitment } from "@/lib/types";
import { PromiseExplorer } from "./promise-explorer";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { mobileAppUrl } from "@/lib/external-services";
import { ProtectedActionLink } from "./protected-action";

export function HomeExperience({ commitments }: { commitments: Commitment[] }) {
  const reduceMotion = useReducedMotion();
  const stateCounts = [...new Map(commitments.map((item) => [item.state, { count: commitments.filter((entry) => entry.state === item.state).length, slug: item.stateSlug }] as const)).entries()].sort(([a],[b])=>a.localeCompare(b));
  const evidenceCount = commitments.reduce((total,item)=>total+item.evidence.length,0);
  const completed = commitments.filter((item)=>item.status === "fulfilled").length;

  return <main className="site-shell">
    <SiteHeader />

    <section className="hero" id="top">
      <div className="hero-grid" aria-hidden="true" />
      <motion.div className="hero-copy" initial={reduceMotion ? false : "hidden"} animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: .12 } } }}>
        <motion.div className="hero-meta" variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: .6 } } }}><p className="eyebrow">INDIA&apos;S PUBLIC PROMISE REGISTER</p></motion.div>
        <motion.h1 className="hero-title" variants={{ hidden: { opacity: 0, y: 44 }, visible: { opacity: 1, y: 0, transition: { duration: .85, ease: [.22, 1, .36, 1] } } }}>Promises leave<br />a <em>trace.</em></motion.h1>
        <motion.div className="hero-bottom" variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: .7 } } }}><p>Vaada keeps the public receipt: who promised, what changed, what evidence exists, and how much time remains.</p><div className="hero-actions"><a className="button button-primary" href={mobileAppUrl}>Launch app <span>↗</span></a><ProtectedActionLink className="button button-ghost hero-record" href="/submit">Put one on record <span>＋</span></ProtectedActionLink></div></motion.div>
      </motion.div>
      <motion.div className="accountability-orbit" initial={reduceMotion ? false : { opacity: 0, scale: .88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: .25, ease: [.22, 1, .36, 1] }} aria-label="A deadline clock representing evidence review"><div className="orbit-ring orbit-ring-outer"><span>DEADLINE</span><span>EVIDENCE</span><span>REVIEW</span><span>PUBLIC</span></div><div className="orbit-ring orbit-ring-inner"/><motion.div className="clock-hand" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}><i /></motion.div><div className="orbit-center"><small>PROMISES</small><strong>{String(commitments.length).padStart(3,"0")}</strong><span>{evidenceCount} SOURCES</span></div><motion.div className="proof-ticket ticket-one" animate={reduceMotion ? undefined : { y: [0,-10,0], rotate: [-2,0,-2] }} transition={{ duration:5,repeat:Infinity,ease:"easeInOut" }}><span>PROOF</span><strong>Human reviewed</strong></motion.div><motion.div className="proof-ticket ticket-two" animate={reduceMotion ? undefined : { y:[0,8,0],rotate:[3,1,3] }} transition={{duration:6,repeat:Infinity,ease:"easeInOut"}}><span>KEPT</span><strong>{completed} verified</strong></motion.div></motion.div>
    </section>

    <section className="register" id="register"><div className="section-heading register-heading"><div><p className="eyebrow">THE PUBLIC REGISTER</p><h2>Promises, clearly tracked.</h2></div></div><PromiseExplorer commitments={commitments} mode="carousel"/></section>

    <section className="stats-shell" aria-label="Register statistics"><div className="stats"><article><strong>{String(commitments.length).padStart(2,"0")}</strong><span>public records</span></article><article><strong>{String(stateCounts.length).padStart(2,"0")}</strong><span>states covered</span></article><article><strong>{String(evidenceCount).padStart(2,"0")}</strong><span>sources on record</span></article><article><strong>{completed}</strong><span>promises kept</span></article></div></section>

    <section className="states" id="states"><div className="section-heading compact"><div><p className="eyebrow">BROWSE BY PLACE</p><h2>Start where<br/>you live.</h2></div><p className="section-copy">State and district labels stay attached to every card and record.</p></div><div className="state-grid">{stateCounts.map(([state,data])=><Link href={`/states/${data.slug}`} className="state-tile" key={state}><span>{state}</span><strong>{String(data.count).padStart(2,"0")}</strong><i>VIEW RECORDS ↗</i></Link>)}</div></section>

    <section className="method" id="method"><p className="eyebrow">ONE TRUSTED FLOW</p><h2>From public tip<br/>to verified record.</h2><div className="method-grid">{[["01","Share the source","Paste a news or social link, upload an image, or add a government document."],["02","AI drafts the form","The agent extracts the promise, date, place, deadline and responsible office for you to correct."],["03","A human verifies","A reviewer inspects the original proof, removes duplicates and decides what enters the register."],["04","Evidence moves progress","Only accepted outcome evidence can change public status or progress."]].map(([number,title,copy],index)=><motion.article initial={reduceMotion ? false : { opacity:0, y:48 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:.35 }} transition={{ duration:.65, delay:index*.08, ease:[.22,1,.36,1] }} key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p>{index < 3 && <motion.i className="method-connector" initial={reduceMotion ? false : { scaleX:0 }} whileInView={{ scaleX:1 }} viewport={{ once:true, amount:.6 }} transition={{ duration:.7, delay:.15+index*.08 }} aria-hidden="true"/>}</motion.article>)}</div></section>

    <section className="app-launch"><div><p className="eyebrow">NATIVE MOBILE ACCOUNTABILITY</p><h2>One promise<br/>per swipe.</h2><p>Open the separate Vaada app with the same records, proof and submission backend.</p></div><a className="button button-primary" href={mobileAppUrl}>Launch mobile app <span>↗</span></a></section>
    <section className="final-cta"><p className="eyebrow">PUBLIC MEMORY IS PUBLIC POWER</p><h2>See a promise?<br/>Put it on record.</h2><div className="final-actions"><ProtectedActionLink className="button button-invert" href="/submit">Record a promise <span>↗</span></ProtectedActionLink><Link className="button button-invert" href="/contact">Contact Vaada <span>↗</span></Link></div></section>
    <SiteFooter/>
  </main>;
}
