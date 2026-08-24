import { SiteHeader } from "@/components/site-header";
import { VaadaLogo } from "@/components/vaada-logo";
import { BackButton } from "@/components/back-button";
import { mobileAppUrl } from "@/lib/external-services";

export default function NotFound(){return <main className="not-found route-shell"><SiteHeader/><VaadaLogo className="not-found-logo"/><span>ERROR · 404</span><h1>This record left<br/>no public trace.</h1><p>It may have moved, still be under review, or never have been published.</p><div className="not-found-actions"><BackButton className="button button-ghost inline-back"/><a className="button button-primary" href="/">Website home →</a><a className="button button-ghost" href={mobileAppUrl}>Open mobile app →</a></div></main>}
