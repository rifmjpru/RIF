import { Link } from "react-router-dom";
import { useSiteData } from "./SiteDataProvider.jsx";

export const Footer = () => {
  const { siteData } = useSiteData();
  const siteSettings = siteData?.siteSettings;

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
      <p className="footer-note">{siteSettings?.footerNote}</p>
      <p className="footer-credit">
        Developed by
        {" "}
        <a href="https://vuntech.online" target="_blank" rel="noreferrer">
          vuntech.online
        </a>
      </p>
    </footer>
  );
};
