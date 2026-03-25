import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "./SiteDataProvider.jsx";

export const Footer = () => {
  const { siteData } = useSiteData();
  const siteSettings = siteData?.siteSettings;
  const baseCount = siteSettings?.visitCount ?? 50000;
  const [visitCount, setVisitCount] = useState(baseCount);

  useEffect(() => {
    try {
      const storageKey = "rif_visit_counter";
      const stored = Number.parseInt(localStorage.getItem(storageKey) || "", 10);
      const safeStored = Number.isFinite(stored) ? stored : 0;
      const next = Math.max(baseCount, safeStored) + 1;
      localStorage.setItem(storageKey, String(next));
      setVisitCount(next);
    } catch (error) {
      // If storage fails (e.g., Safari private mode), just show the base count + 1 for this session.
      setVisitCount((current) => Math.max(current, baseCount) + 1);
    }
  }, [baseCount]);

  const visitDigits = visitCount.toString().padStart(6, "0").split("");

  return (
    <footer className="site-footer">
      <div className="footer-panel">
        <div>
          <p className="section-eyebrow">RIF</p>
          <h3>{siteSettings?.fullName || "Rohilkhand Incubation Foundation"}</h3>
          <p>{siteSettings?.tagline}</p>
        </div>
        <div>
          <p className="footer-label">Contact</p>
          <a href={`mailto:${siteSettings?.contactEmail}`}>{siteSettings?.contactEmail}</a>
          <a href={`tel:${siteSettings?.contactPhone}`}>{siteSettings?.contactPhone}</a>
          <p>{siteSettings?.location}</p>
        </div>
        <div>
          <p className="footer-label">Quick Links</p>
          <Link to="/apply">Apply Now</Link>
          <Link to="/membership-register">Membership Form</Link>
          <Link to="/incubatee-register">incubatee Form</Link>
        </div>
        <div>
          <p className="footer-label">Legal</p>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-and-conditions">Terms & Conditions</Link>
          <Link to="/refund-policy">Refund Policy</Link>
        </div>
      </div>
      <p className="footer-note">{siteSettings?.footerNote || "RIF © | All Rights Reserved."}</p>
      <p className="footer-credit">
        Developed by{" "}
        <a href="https://vuntech.online" target="_blank" rel="noreferrer">
          vuntech.online
        </a>
      </p>
      <div className="footer-bottom">
        <div className="footer-visit-mini" title="Website visits">
          {visitDigits.map((digit, idx) => (
            <span key={`visit-digit-${idx}`}>{digit}</span>
          ))}
        </div>
      </div>
    </footer>
  );
};
