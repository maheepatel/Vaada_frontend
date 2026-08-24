"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { publicStatusLabel } from "@/lib/status";
import type { Commitment } from "@/lib/types";
import { formatPublicDate, hasAcceptedProof, promiseStage, promiseStages } from "@/lib/promise-view";

type Sheet = "state" | "sector" | "status" | null;

export function PromiseExplorer({ commitments, mode = "grid" }: { commitments: Commitment[]; compact?: boolean; mode?: "grid" | "carousel" }) {
  const [state, setState] = useState("All states");
  const [district, setDistrict] = useState("All districts");
  const [sector, setSector] = useState("All sectors");
  const [status, setStatus] = useState("All status");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [page, setPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const states = useMemo(() => ["All states", ...new Set(commitments.map((item) => item.state))], [commitments]);
  const districts = useMemo(() => ["All districts", ...new Set(commitments.filter((item) => state === "All states" || item.state === state).map((item) => item.district))], [commitments, state]);
  const sectors = useMemo(() => ["All sectors", ...new Set(commitments.map((item) => item.category))], [commitments]);
  const statuses = ["All status", "Waiting", "In progress", "Promise kept", "Late", "Disputed"];
  const filtered = commitments.filter((item) => (state === "All states" || item.state === state) && (district === "All districts" || item.district === district) && (sector === "All sectors" || item.category === sector) && (status === "All status" || publicStatusLabel(item.status) === status));
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const visible = mode === "carousel" ? filtered.slice(0, 6) : filtered.slice((activePage - 1) * pageSize, activePage * pageSize);
  const data = sheet === "sector" ? { title: "Choose a sector", values: sectors, active: sector, set: setSector } : sheet === "status" ? { title: "Choose a status", values: statuses, active: status, set: setStatus } : null;

  const resetCarousel = () => {
    setCarouselIndex(0);
    carouselRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const moveCarousel = (direction: -1 | 1) => {
    const viewport = carouselRef.current;
    if (!viewport || visible.length < 2) return;
    const nextIndex = Math.min(visible.length - 1, Math.max(0, carouselIndex + direction));
    const target = viewport.querySelector<HTMLElement>(`[data-carousel-index="${nextIndex}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setCarouselIndex(nextIndex);
  };

  return <div className="website-explorer">
    <div className="website-filter-bar" aria-label="Promise filters">
      <button type="button" onClick={() => setSheet("state")}><span>State &amp; district</span><strong>{district !== "All districts" ? `${state} · ${district}` : state}</strong><i aria-hidden="true" /></button>
      <button type="button" onClick={() => setSheet("sector")}><span>Sector</span><strong>{sector === "All sectors" ? "All sectors" : sector}</strong><i aria-hidden="true" /></button>
      <button type="button" onClick={() => setSheet("status")}><span>Status</span><strong>{status === "All status" ? "All status" : status}</strong><i aria-hidden="true" /></button>
    </div>
    <div className="explorer-count"><span>{String(filtered.length).padStart(2,"0")} RECORDS</span><span>{mode === "carousel" ? `SHOWING ${String(visible.length).padStart(2,"0")} FEATURED` : `PAGE ${String(activePage).padStart(2,"0")} OF ${String(pageCount).padStart(2,"0")}`}</span></div>
    {mode === "carousel" && visible.length > 1 && <nav className="carousel-toolbar" aria-label="Featured promises carousel"><span>{String(carouselIndex + 1).padStart(2,"0")} / {String(visible.length).padStart(2,"0")}</span><div><button type="button" disabled={carouselIndex === 0} onClick={() => moveCarousel(-1)} aria-label="Previous promise">← Previous</button><button type="button" disabled={carouselIndex === visible.length - 1} onClick={() => moveCarousel(1)} aria-label="Next promise">Next →</button></div></nav>}
    <div ref={carouselRef} className={`website-promise-grid ${mode === "carousel" ? "carousel-grid" : ""}`}>
      <div className={mode === "carousel" ? "carousel-track" : "website-grid-track"}>
      {visible.map((item,index) => { const stage = promiseStage(item); const hasProof = hasAcceptedProof(item); const displayIndex = mode === "carousel" ? index : (activePage - 1) * pageSize + index; return <article className="website-promise-card" data-carousel-index={mode === "carousel" ? index : undefined} key={item.id}>
        <div className="website-card-head"><span className="mobile-card-number">{String(displayIndex + 1).padStart(2,"0")}</span><span className={`status ${item.status === "broken" ? "late" : item.status === "fulfilled" ? "done" : "progress"}`}><i />{publicStatusLabel(item.status)}</span></div>
        <p className="mobile-card-location">{item.state} · {item.district} · {item.category}</p>
        <h2>{item.title}</h2><p className="website-card-summary">{item.detail}</p>
        <div className="mobile-card-authority"><span>RESPONSIBLE OFFICE</span><strong>{item.accountableOffice}</strong></div>
        <dl className={`mobile-card-dates ${item.deadlineStart ? "has-window" : ""}`}><div><dt>Promised</dt><dd>{formatPublicDate(item.promisedOn)}</dd></div>{item.deadlineStart && <div><dt>Window starts</dt><dd>{formatPublicDate(item.deadlineStart)}</dd></div>}<div><dt>{item.deadlineStart ? "Window ends" : "Deadline"}</dt><dd>{formatPublicDate(item.deadline)}</dd></div></dl>{item.deadlineLabel && <p className="deadline-window-label">Stated timeframe · {item.deadlineLabel}</p>}
        <div className="website-stage-wrap"><div className="mobile-stage-copy"><span>PROMISE STAGE</span><strong>{promiseStages[stage]}</strong></div><ol className="mobile-stages">{promiseStages.map((label,stageIndex)=><li className={stageIndex<=stage?"reached":""} key={label}><i/><span>{label}</span></li>)}</ol></div>
        <div className="mobile-card-actions"><Link className="mobile-record-button" href={`/promises/${item.slug}`}>View record <span>↗</span></Link>{item.status === "fulfilled" && hasProof ? <Link className="mobile-proof-button complete" href={`/promises/${item.slug}#completion-proof`}>View proof <span>✓</span></Link> : <Link className="mobile-proof-button" href={`/submit?mode=proof&promise=${item.slug}`}>Submit proof <span>＋</span></Link>}</div>
        <div className="mobile-card-progress"><div><span>VERIFIED PROGRESS</span><strong>{item.progress}%</strong></div><div className="progress-track"><span style={{width:`${item.progress}%`}}/></div><small>Reviewed {formatPublicDate(item.lastReviewedAt)}</small></div>
      </article>; })}
      {!visible.length && <div className="mobile-no-results"><strong>No promises match.</strong><p>Change one of the three filters.</p><button type="button" onClick={()=>{setState("All states");setDistrict("All districts");setSector("All sectors");setStatus("All status");setPage(1);resetCarousel();}}>Reset filters</button></div>}
      </div>
    </div>
    {mode === "grid" && filtered.length > pageSize && <nav className="promise-pagination" aria-label="Promise pages"><button type="button" disabled={activePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Previous</button><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button type="button" className={number === activePage ? "active" : ""} aria-current={number === activePage ? "page" : undefined} onClick={() => setPage(number)} key={number}>{number}</button>)}</div><button type="button" disabled={activePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next →</button></nav>}
    {sheet && <div className="website-filter-layer" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setSheet(null);}}><section className="website-filter-sheet" role="dialog" aria-modal="true" aria-label={sheet === "state" ? "Choose a state or district" : data?.title}><div className="mobile-sheet-head"><div><span>FILTER REGISTER</span><h2>{sheet === "state" ? "Choose a state or district" : data?.title}</h2></div><button type="button" onClick={()=>setSheet(null)} aria-label="Close">×</button></div>{sheet === "state" ? <div className="website-location-options"><div><span>STATE</span><div className="website-filter-options">{states.map((value)=><button className={state===value?"selected":""} type="button" key={value} onClick={()=>{setState(value);setDistrict("All districts");setPage(1);resetCarousel();}}><span>{value}</span><i>{state===value?"✓":""}</i></button>)}</div></div><div><span>DISTRICT</span><div className="website-filter-options">{districts.map((value)=><button className={district===value?"selected":""} type="button" key={value} onClick={()=>{setDistrict(value);setPage(1);resetCarousel();setSheet(null);}}><span>{value}</span><i>{district===value?"✓":""}</i></button>)}</div></div></div> : data ? <div className="website-filter-options">{data.values.map((value)=><button className={data.active===value?"selected":""} type="button" key={value} onClick={()=>{data.set(value);setPage(1);resetCarousel();setSheet(null);}}><span>{value}</span><i>{data.active===value?"✓":""}</i></button>)}</div> : null}</section></div>}
  </div>;
}
