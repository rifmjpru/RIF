import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

const spotlightPartners = [
  { label: "G20 India", src: "/images/partners/g20-logo.webp" },
  { label: "NGO Darpan", src: "/images/partners/ngo-darpan.webp" },
  { label: "ISO", src: "/images/partners/startup.webp" },
  { label: "Startup India", src: "/images/partners/startinup.webp" },
  { label: "Udyam", src: "/images/partners/PngItem_2411963.webp" },
  { label: "12A / 80G", src: "/images/partners/12a-80G-1.webp" },
  { label: "Partner Mark", src: "/images/partners/Captur11e.webp" },
  { label: "RIF", src: "/images/partners/logo.jpg" }
];

export default function HomePage() {
  const { siteData } = useSiteData();
  const homepage = siteData?.homepage;
  const slides =
    siteData?.heroSlider?.length
      ? siteData.heroSlider
      : [
          {
            id: "hero-fallback",
            title: "Home Hero Slide",
            imageUrl: ""
          }
        ];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length) {
      setActiveSlide(0);
      return;
    }

    setActiveSlide((current) => current % slides.length);
  }, [slides.length]);

  const goToSlide = (index) => {
    if (!slides.length) {
      return;
    }

    setActiveSlide((index + slides.length) % slides.length);
  };

  const sanitizePublicLink = (value, fallback) => {
    if (!value) {
      return fallback;
    }

    return value.startsWith("/admin") ? fallback : value;
  };

  const getSlideObjectPosition = (slide) => {
    const focusX = Number.isFinite(Number(slide?.focusX)) ? Math.min(Math.max(Number(slide.focusX), 0), 100) : 50;
    const focusY = Number.isFinite(Number(slide?.focusY)) ? Math.min(Math.max(Number(slide.focusY), 0), 100) : 50;
    return `${focusX}% ${focusY}%`;
  };

  return (
    <>
      <section className="home-slider-shell">
        <div className="home-slider-stage">
          <div className="home-slider-media">
            {slides.map((slide, index) => (
              <div
                aria-hidden={index !== activeSlide}
                className={index === activeSlide ? "home-slide home-slide-active" : "home-slide"}
                key={slide.id || index}
              >
                <div
                  aria-hidden
                  className="home-slide-image-backdrop"
                  style={{ backgroundImage: `url(${resolveMediaUrl(slide.imageUrl, slide.title)})` }}
                />
                <img
                  alt={slide.title || `Slide ${index + 1}`}
                  className="home-slide-image"
                  style={{ objectPosition: getSlideObjectPosition(slide) }}
                  src={resolveMediaUrl(slide.imageUrl, slide.title)}
                />
              </div>
            ))}
            <div className="home-slide-overlay" />
            <div className="home-slide-controls">
              <button className="slider-arrow" onClick={() => goToSlide(activeSlide - 1)} type="button">
                ←
              </button>
              <div className="slider-dots">
                {slides.map((slide, index) => (
                  <button
                    aria-label={`Go to slide ${index + 1}`}
                    className={index === activeSlide ? "slider-dot slider-dot-active" : "slider-dot"}
                    key={slide.id || index}
                    onClick={() => goToSlide(index)}
                    type="button"
                  />
                ))}
              </div>
              <button className="slider-arrow" onClick={() => goToSlide(activeSlide + 1)} type="button">
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-grid home-copy-shell">
        <div className="hero-copy home-copy-panel">
          <p className="section-eyebrow">{homepage?.hero?.eyebrow}</p>
          <h1>{homepage?.hero?.title}</h1>
          <p className="section-description">{homepage?.hero?.description}</p>
          <div className="hero-actions">
            <Link className="button" to={homepage?.hero?.primaryCtaLink || "/apply"}>
              {homepage?.hero?.primaryCtaLabel || "Apply Now"}
            </Link>
            <Link className="button button-ghost" to={homepage?.hero?.secondaryCtaLink || "/membership-plans"}>
              {homepage?.hero?.secondaryCtaLabel || "Explore Membership"}
            </Link>
          </div>
        </div>
        <div className="hero-spotlight home-copy-spotlight">
          <p className="hero-spotlight-title">Current Slide</p>
          <h3>{slides[activeSlide]?.title || "Hero Image"}</h3>
          <Link className="text-link" to="/gallery">
            View gallery highlights
          </Link>
          <div className="spotlight-partner-wrap">
            <p className="hero-spotlight-title">Affiliations and Standards</p>
            <div className="spotlight-partner-strip">
              {spotlightPartners.map((partner) => (
                <div className="spotlight-partner-item spotlight-partner-image" key={partner.label}>
                  {partner.src ? (
                    <img alt={partner.label} src={partner.src} />
                  ) : (
                    <span className="spotlight-partner-fallback">{partner.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="stats-grid">
          {homepage?.stats?.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Focus Areas"
          title="Built for founders solving hard, relevant problems."
          description="The visual language takes cues from leading incubator platforms while keeping the content tailored to RIF's regional and institutional mission."
        />
        <div className="chip-grid">
          {homepage?.focusAreas?.map((item) => (
            <span className="focus-chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="section section-dark">
        <SectionHeading eyebrow="Founder Stories" title="Signals of momentum across sectors." />
        <div className="card-grid card-grid-3">
          {homepage?.startupStories?.map((story) => (
            <article className="content-card content-card-dark" key={story.name}>
              <p className="meta-line">
                <span>{story.sector}</span>
              </p>
              <h3>{story.name}</h3>
              <p>{story.highlight}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Journey" title="A simple venture flow for institutional teams and founders." />
        <div className="timeline-grid">
          {homepage?.timeline?.map((item, index) => (
            <article className="timeline-card" key={item.title}>
              <span className="timeline-index">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Latest" title="News, events, and current momentum." />
        <div className="split-grid">
          <div className="stacked-list">
            {siteData?.news?.map((item) => (
              <article className="list-card" key={item.id}>
                <p className="meta-line">
                  <span>{item.type}</span>
                  <span>{item.category}</span>
                </p>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
              </article>
            ))}
          </div>
          <div className="cta-panel">
            <p className="section-eyebrow">CMS and Admin</p>
            <h3>{homepage?.cta?.title}</h3>
            <p>{homepage?.cta?.description}</p>
            <div className="hero-actions">
              <Link className="button" to={sanitizePublicLink(homepage?.cta?.primaryLink, "/contact")}>
                {homepage?.cta?.primaryLabel || "Contact RIF"}
              </Link>
              <Link className="button button-ghost" to={sanitizePublicLink(homepage?.cta?.secondaryLink, "/about")}>
                {homepage?.cta?.secondaryLabel || "Learn More"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
