import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

export default function GalleryPage() {
  const { siteData } = useSiteData();
  const gallery = siteData?.gallery;
  const fallbackGallery =
    !gallery?.length && siteData?.heroSlider?.length
      ? siteData.heroSlider
          .filter((slide) => slide?.imageUrl)
          .map((slide, index) => ({
            id: slide.id || `hero-fallback-${index}`,
            title: slide.title || "Gallery Image",
            imageUrl: slide.imageUrl
          }))
      : [];

  const galleryItems = gallery?.length ? gallery : fallbackGallery;
  const usingFallback = !gallery?.length && galleryItems?.length;

  const handleImageError = (event, title) => {
    event.target.src = resolveMediaUrl("", title);
  };

  return (
    <section className="section gallery-simple-section">
      <div className="gallery-simple-heading">
        <span aria-hidden className="gallery-simple-accent" />
        <h1>Image Gallery</h1>
        <svg aria-hidden focusable="false" height="22" viewBox="0 0 64 22" width="64" className="heading-illustration">
          <rect x="2" y="9" width="18" height="4" rx="2" fill="var(--primary)" />
          <rect x="24" y="6" width="14" height="10" rx="2" fill="var(--accent)" />
          <rect x="42" y="9" width="20" height="4" rx="2" fill="var(--primary)" />
        </svg>
      </div>
      {galleryItems?.length ? (
        <>
          <div className="gallery-simple-grid">
            {galleryItems.map((item) => (
              <article className="gallery-simple-card" key={item.id}>
                <img
                  alt={item.altText || item.title}
                  className="gallery-simple-image"
                  src={resolveMediaUrl(item.imageUrl, item.title)}
                  loading="lazy"
                  onError={(event) => handleImageError(event, item.title)}
                />
                {item.title ? <p className="gallery-simple-caption">{item.title}</p> : null}
              </article>
            ))}
          </div>
          {usingFallback ? <p className="gallery-note">Showing hero slider images until gallery items are added.</p> : null}
        </>
      ) : (
        <div className="empty-state">
          <h3>Gallery is empty.</h3>
        </div>
      )}
    </section>
  );
}
