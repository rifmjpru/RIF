import { useState } from "react";
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

const qrConnectUrl = "https://forms.gle/XTdecnwMjBqfrEvHA";
const heroVideoSrc = "/videos/rif-hero-logo.mp4";
const miniVideoSrc = "/videos/Video_Generation_With_Logo.mp4";


export default function HomePage() {
  const { siteData } = useSiteData();
  const homepage = siteData?.homepage;
  const testimonials =
    homepage?.testimonials?.length
      ? homepage.testimonials
      : (homepage?.startupStories || []).map((story) => ({
          id: story.id,
          name: story.name,
          role: story.sector,
          quote: story.highlight
        }));
  const testimonialsSection = homepage?.testimonialsSection || {};
  const previewCount = Number(testimonialsSection.previewCount) > 0 ? Number(testimonialsSection.previewCount) : 3;
  const previewTestimonials = testimonials.slice(0, previewCount);
  const imageSlides =
    siteData?.heroSlider?.length
      ? siteData.heroSlider.map((slide, index) => ({
          ...slide,
          mediaType: "image",
          key: slide.id || `hero-image-${index}`
        }))
      : [];
  const heroSlides = [
    {
      key: "hero-video",
      title: "RIF Hero Video",
      mediaType: "video",
      src: heroVideoSrc
    },
    ...imageSlides
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const sanitizePublicLink = (value, fallback) => {
    if (!value) {
      return fallback;
    }

    return value.startsWith("/admin") ? fallback : value;
  };

  const goToSlide = (index) => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
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
            {heroSlides.map((slide, index) => (
              <div
                aria-hidden={index !== activeSlide}
                className={
                  index === activeSlide
                    ? `home-slide home-slide-active ${slide.mediaType === "video" ? "home-slide-video-panel" : ""}`.trim()
                    : `home-slide ${slide.mediaType === "video" ? "home-slide-video-panel" : ""}`.trim()
                }
                key={slide.key}
              >
                {slide.mediaType === "video" ? (
                  <video
                    aria-label={slide.title}
                    autoPlay
                    className="home-slide-video"
                    loop
                    muted
                    playsInline
                  >
                    <source src={slide.src} type="video/mp4" />
                  </video>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            ))}
            <div
              className={
                heroSlides[activeSlide]?.mediaType === "video"
                  ? "home-slide-overlay home-slide-overlay-hidden"
                  : "home-slide-overlay"
              }
            />
            <div className="home-slide-controls">
              <button className="slider-arrow" onClick={() => goToSlide(activeSlide - 1)} type="button">
                ←
              </button>
              <div className="slider-dots">
                {heroSlides.map((slide, index) => (
                  <button
                    aria-label={`Go to ${slide.mediaType === "video" ? "video" : `slide ${index + 1}`}`}
                    className={index === activeSlide ? "slider-dot slider-dot-active" : "slider-dot"}
                    key={slide.key}
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
          <div aria-hidden="true" className="home-copy-launch-bg">
            <span className="home-copy-cloud home-copy-cloud-one" />
            <span className="home-copy-cloud home-copy-cloud-two" />
            <span className="home-copy-cloud home-copy-cloud-three" />
            <span className="home-copy-star home-copy-star-one" />
            <span className="home-copy-star home-copy-star-two" />
            <span className="home-copy-star home-copy-star-three" />
            <span className="home-copy-star home-copy-star-four" />
            <span className="home-copy-launch-ring home-copy-launch-ring-one" />
            <span className="home-copy-launch-ring home-copy-launch-ring-two" />
            <div className="home-copy-launch-trail" />
            <svg className="home-copy-launch-rocket" fill="none" viewBox="0 0 180 260" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="launchRocketBody" x1="63" x2="117" y1="35" y2="155" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFF8F2" />
                  <stop offset="1" stopColor="#FFD7CE" />
                </linearGradient>
                <linearGradient id="launchRocketFlame" x1="90" x2="90" y1="164" y2="248" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFBC66" />
                  <stop offset="1" stopColor="#FFF1DA" stopOpacity="0.06" />
                </linearGradient>
              </defs>
              <path d="M90 26C117 47 134 79 136 117L90 153L44 117C46 79 63 47 90 26Z" fill="url(#launchRocketBody)" />
              <path d="M90 26C117 47 134 79 136 117L90 153V26Z" fill="#FFD1C7" />
              <path d="M90 26C117 47 134 79 136 117L90 153L44 117C46 79 63 47 90 26Z" stroke="#1F4DA7" strokeWidth="5" />
              <circle cx="90" cy="93" fill="#1F4DA7" r="16" />
              <circle cx="90" cy="93" fill="#8EC4FF" r="8.5" />
              <path d="M61 118L37 142L61 145L77 128L61 118Z" fill="#CE2026" stroke="#1F4DA7" strokeWidth="5" />
              <path d="M119 118L143 142L119 145L103 128L119 118Z" fill="#CE2026" stroke="#1F4DA7" strokeWidth="5" />
              <path d="M72 150H108L90 182L72 150Z" fill="#1F4DA7" />
              <path d="M90 152L60 248H120L90 152Z" fill="url(#launchRocketFlame)" />
            </svg>
          </div>
          <p className="section-eyebrow">{homepage?.hero?.eyebrow}</p>
          <h1>{homepage?.hero?.title}</h1>
          <p className="section-description">{homepage?.hero?.description}</p>
          <div className="hero-actions">
            <Link className="button" to={homepage?.hero?.primaryCtaLink || "/enquiry"}>
              {homepage?.hero?.primaryCtaLabel || "Send Enquiry"}
            </Link>
            <Link className="button button-ghost" to={homepage?.hero?.secondaryCtaLink || "/membership-plans"}>
              {homepage?.hero?.secondaryCtaLabel || "Explore Membership"}
            </Link>
          </div>
        </div>
        <div className="hero-spotlight home-copy-spotlight">
          <div className="home-spotlight-video-wrap">
            <video
              aria-label="RIF Hero Video"
              autoPlay
              className="home-spotlight-video"
              loop
              muted
              playsInline
            >
              <source src={miniVideoSrc} type="video/mp4" />
            </video>
          </div>
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
        <SectionHeading
          eyebrow={testimonialsSection.eyebrow || "Testimonials"}
          title={testimonialsSection.title || "What founders, members, and ecosystem partners say about working with RIF."}
          description={testimonialsSection.description || ""}
        />
        <div className="card-grid card-grid-3">
          {previewTestimonials.map((testimonial) => (
            <article className="content-card content-card-dark testimonial-card" key={testimonial.id || testimonial.name}>
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <h3>{testimonial.name}</h3>
              <p className="detail-line">{testimonial.role}</p>
            </article>
          ))}
        </div>
        {testimonials.length > previewCount ? (
          <div className="hero-actions">
            <Link className="button" to={testimonialsSection.ctaLink || "/testimonials"}>
              {testimonialsSection.ctaLabel || "View More Testimonials"}
            </Link>
          </div>
        ) : null}
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
            {homepage?.cta?.qrTitle || homepage?.cta?.qrImageUrl ? (
              <div className="home-cta-qr-card">
                <div className="home-cta-qr-copy">
                  <p className="home-cta-qr-label">{homepage?.cta?.qrLabel || "Quick Scan"}</p>
                  <h4>{homepage?.cta?.qrTitle || "Connect with RIF"}</h4>
                  {homepage?.cta?.qrNote ? <p>{homepage.cta.qrNote}</p> : null}
                </div>
                <div className="qr-action-stack">
                  <div className="home-cta-qr-preview home-cta-qr-preview-large">
                    {homepage?.cta?.qrImageUrl ? (
                      <img
                        alt={homepage?.cta?.qrTitle || "RIF QR code"}
                        className="home-cta-qr-image"
                        src={resolveMediaUrl(homepage.cta.qrImageUrl, homepage?.cta?.qrTitle || "RIF QR code")}
                      />
                    ) : (
                      <div className="home-cta-qr-placeholder">QR</div>
                    )}
                  </div>
                  <a className="button button-small qr-connect-action" href={qrConnectUrl} rel="noreferrer" target="_blank">
                    Click to Connect
                  </a>
                </div>
              </div>
            ) : null}
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
