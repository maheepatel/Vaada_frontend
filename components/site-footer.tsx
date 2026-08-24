
import { VaadaLogo } from "./vaada-logo";
import { mobileAppUrl } from "@/lib/external-services";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-top">
        <div><VaadaLogo className="footer-mark" tagline /><p>Public promises.<br />Public proof.</p></div>
        <div className="footer-links">
          <div><span>EXPLORE</span><a href="/promises">Register</a><a href="/rankings">Rankings</a><a href="/completed">Completed</a><a href="/states/rajasthan">States</a><a href={mobileAppUrl}>Open mobile app</a></div>
          <div><span>CONTRIBUTE</span><a href="/submit">Record a promise</a><a href="/submit?mode=proof">Submit proof</a><a href="/my-logs">My logs</a></div>
          <div><span>TRUST</span><a href="/methodology">Methodology</a><a href="/methodology#editorial">Editorial policy</a><a href="/methodology#corrections">Corrections</a><a href="/contact">Contact us</a><a href="/login">Reviewer login</a></div>
        </div>
      </div>
      <div className="footer-number" aria-hidden="true">VAADA</div>
      <div className="footer-base"><span>© 2026 VAADA</span><span>BUILT FOR PUBLIC ACCOUNTABILITY IN INDIA</span></div>
    </footer>
  );
}
