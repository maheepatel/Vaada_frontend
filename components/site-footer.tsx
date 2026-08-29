
import { VaadaLogo } from "./vaada-logo";
import { mobileAppUrl } from "@/lib/external-services";
import { ProtectedActionLink } from "./protected-action";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-top">
        <div><VaadaLogo className="footer-mark" tagline tone="light" /><p>Public promises.<br />Public proof.</p></div>
        <div className="footer-links">
          <div><span>EXPLORE</span><a href="/promises">Register</a><a href="/rankings">Rankings</a><a href="/completed">Completed</a><a href="/states/rajasthan">States</a><a href={mobileAppUrl}>Open mobile app</a></div>
          <div><span>CONTRIBUTE</span><ProtectedActionLink href="/submit">Record a promise</ProtectedActionLink><ProtectedActionLink href="/submit-proof">Submit proof</ProtectedActionLink><ProtectedActionLink href="/my-logs" hideWhenSignedOut>My records</ProtectedActionLink></div>
          <div><span>TRUST</span><a href="/methodology">Methodology</a><a href="/methodology#editorial">Editorial policy</a><a href="/methodology#corrections">Corrections</a><a href="/contact">Contact us</a><ProtectedActionLink href="/review" roles={["reviewer","admin"]} hideWhenSignedOut>Review queue</ProtectedActionLink></div>
        </div>
      </div>
      <div className="footer-number" aria-hidden="true">VAADA</div>
      <div className="footer-base"><span>© 2026 VAADA</span><span>BUILT FOR PUBLIC ACCOUNTABILITY IN INDIA</span></div>
    </footer>
  );
}
