import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Contact Vaada" };
export default function ContactPage(){return <main className="site-shell route-shell"><SiteHeader/><section className="route-hero"><p className="eyebrow">CONTACT VAADA</p><h1>Questions,<br/><span>corrections?</span></h1><p>Reach the right team for general questions, public corrections or security reports.</p></section><section className="route-section"><div className="contact-grid"><a href="mailto:hello@vaada.in"><span>GENERAL</span><h2>hello@vaada.in</h2><i>↗</i></a><a href="mailto:corrections@vaada.in"><span>CORRECTIONS</span><h2>corrections@vaada.in</h2><i>↗</i></a><a href="mailto:security@vaada.in"><span>SECURITY</span><h2>security@vaada.in</h2><i>↗</i></a></div><p className="ranking-note">These are launch placeholders. Replace them with verified inboxes before public release.</p></section><SiteFooter/></main>}
