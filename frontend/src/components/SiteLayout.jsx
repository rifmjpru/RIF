import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer.jsx";
import { Header } from "./Header.jsx";
import { useSiteData } from "./SiteDataProvider.jsx";

export const SiteLayout = () => {
  const { status, error, contentSource } = useSiteData();
  const location = useLocation();
  const fallbackMessage =
    error && contentSource === "cache"
      ? "Live content is unavailable right now. Showing the last saved site content."
      : error && contentSource === "fallback"
        ? "Live content is unavailable right now. Showing bundled fallback content."
        : "";

  useEffect(() => {
    const revealSelector = [
      ".hero-grid",
      ".home-slider-shell",
      ".page-hero",
      ".section",
      ".section-heading",
      ".form-shell",
      ".footer-panel",
      ".content-card",
      ".list-card",
      ".stat-card",
      ".pricing-card",
      ".timeline-card",
      ".gallery-card",
      ".gallery-image-card",
      ".gallery-admin-card",
      ".visual-card",
      ".admin-panel",
      ".admin-card",
      ".submission-row",
      ".admin-login-card"
    ].join(", ");

    const elements = Array.from(document.querySelectorAll(revealSelector));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isElementInView = (element) => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

      return rect.bottom > 0 && rect.right > 0 && rect.top < viewportHeight && rect.left < viewportWidth;
    };

    if (prefersReducedMotion) {
      elements.forEach((element) => element.classList.add("reveal-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach((element, index) => {
      if (isElementInView(element)) {
        element.classList.add("reveal-visible");
        element.classList.remove("reveal-ready");
        return;
      }

      element.classList.add("reveal-ready");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [location.pathname, status]);

  useEffect(() => {
    const targetId = location.hash.replace("#", "");

    if (!targetId) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.hash]);

  return (
    <div className="app-shell">
      <Header />
      {fallbackMessage ? <div className="status-banner">{fallbackMessage}</div> : null}
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
