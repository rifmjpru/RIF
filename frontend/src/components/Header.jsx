import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { applyAction, navigation } from "../data/navigation.js";
import { useSiteData } from "./SiteDataProvider.jsx";

const navClassName = ({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link");
const isExternalLink = (value = "") => /^https?:\/\//i.test(value);

export const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [openMobileGroup, setOpenMobileGroup] = useState(null);
  const { siteData } = useSiteData();
  const tickerEntries = [
    ...(siteData?.news || []).map((item) => ({
      id: item.id,
      label: item.type || "News",
      title: item.title,
      href: item.link || "/news-events"
    })),
    ...(siteData?.events || []).map((item) => ({
      id: item.id,
      label: item.status || "Event",
      title: item.title,
      href: item.link || "/news-events"
    }))
  ];
  const loopedTickerEntries = tickerEntries.length > 1 ? [...tickerEntries, ...tickerEntries] : tickerEntries;

  const isGroupActive = (item) => {
    if (item.to === "/") {
      return location.pathname === "/";
    }

    if (location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)) {
      return true;
    }

    return item.children?.some((child) => child.to.split("#")[0] === location.pathname);
  };

  const closeMobileNav = () => {
    setMobileOpen(false);
    setOpenMenu(null);
    setOpenMobileGroup(null);
  };

  useEffect(() => {
    closeMobileNav();
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const root = document.documentElement;

    if (mobileOpen) {
      root.classList.add("mobile-nav-open");
      document.body.style.overflow = "hidden";
    } else {
      root.classList.remove("mobile-nav-open");
      document.body.style.overflow = "";
    }

    return () => {
      root.classList.remove("mobile-nav-open");
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="site-header">
        <Link className="brand-mark" to="/">
        <img className="brand-badge" src="/images/partners/logo.jpg" alt="rif logo" />
          <span>
            {/* <strong>{siteData?.siteSettings?.fullName || "Rohilkhand Incubation Foundation"}</strong> */}
            {/* <small>{siteData?.siteSettings?.location || "Innovation Platform"}</small> */}
          </span>
        </Link>
        <nav className="site-nav desktop-nav" aria-label="Primary">
          {navigation.map((item) => (
            item.children?.length ? (
              <div
                className="nav-group"
                key={item.id}
                onMouseEnter={() => setOpenMenu(item.id)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <div className={isGroupActive(item) ? "nav-group-head nav-group-head-active" : "nav-group-head"}>
                  <NavLink className={navClassName} to={item.to}>
                    {item.label}
                  </NavLink>
                  <button
                    aria-expanded={openMenu === item.id}
                    aria-label={`Toggle ${item.label}`}
                    className="nav-chevron"
                    onClick={() => setOpenMenu((current) => (current === item.id ? null : item.id))}
                    type="button"
                  >
                    ▾
                  </button>
                </div>
                <div className={openMenu === item.id ? "dropdown-panel dropdown-panel-open" : "dropdown-panel"}>
                  <div className="dropdown-accent" />
                  {item.children.map((child) => (
                    <Link className="dropdown-link" key={child.to} to={child.to}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={item.to} className={navClassName} to={item.to}>
                {item.label}
              </NavLink>
            )
          ))}
        </nav>
        <div className="header-actions">
          <Link className="button desktop-cta" to={applyAction.to}>
            {applyAction.label}
          </Link>
          <button className="menu-toggle" onClick={() => setMobileOpen((open) => !open)} type="button">
            <span className="menu-icon" aria-hidden>
              {mobileOpen ? "✕" : "☰"}
            </span>
            <span>{mobileOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </header>
      {mobileOpen ? (
        <div className="mobile-nav-backdrop" onClick={closeMobileNav} role="presentation" />
      ) : null}
      {mobileOpen ? (
        <nav className="mobile-nav" aria-label="Mobile">
          {navigation.map((item) => (
            <div className="mobile-nav-group" key={item.id}>
              <div className="mobile-nav-head">
                <NavLink className={navClassName} onClick={closeMobileNav} to={item.to}>
                  {item.label}
                </NavLink>
                {item.children?.length ? (
                  <button
                    aria-expanded={openMobileGroup === item.id}
                    aria-label={`Toggle ${item.label} links`}
                    className="mobile-nav-toggle"
                    onClick={() => setOpenMobileGroup((current) => (current === item.id ? null : item.id))}
                    type="button"
                  >
                    {openMobileGroup === item.id ? "−" : "+"}
                  </button>
                ) : null}
              </div>
              {item.children?.length ? (
                <div className={openMobileGroup === item.id ? "mobile-subnav mobile-subnav-open" : "mobile-subnav"}>
                  {item.children.map((child) => (
                    <Link className="mobile-subnav-link" key={child.to} onClick={closeMobileNav} to={child.to}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <Link className="button mobile-admin-link" onClick={closeMobileNav} to={applyAction.to}>
            {applyAction.label}
          </Link>
        </nav>
      ) : null}
      <div className="announcement-bar announcement-ticker">
        <div className="ticker-shell">
          <span className="ticker-label">News & Events</span>
          {loopedTickerEntries.length ? (
            <div className="ticker-track">
              <div className={loopedTickerEntries.length > 1 ? "ticker-lane" : "ticker-lane ticker-lane-static"}>
                {loopedTickerEntries.map((item, index) => (
                  <a
                    className="ticker-item"
                    href={item.href}
                    key={`${item.id}-${index}`}
                    rel={isExternalLink(item.href) ? "noreferrer" : undefined}
                    target={isExternalLink(item.href) ? "_blank" : undefined}
                  >
                    <span className="ticker-badge">{item.label}</span>
                    <span className="ticker-text">{item.title}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <p className="ticker-empty">{siteData?.homepage?.announcement || "Loading updates..."}</p>
          )}
        </div>
      </div>
    </>
  );
};
