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
    <>
      <section className="section gallery-simple-section">
        <div className="gallery-simple-heading">
          <span aria-hidden className="gallery-simple-accent" />
          <h1>Image Gallery</h1>
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
            {usingFallback ? (
              <p className="gallery-note">Showing hero slider images until gallery items are added.</p>
            ) : null}
          </>
        ) : (
          <div className="empty-state">
            <h3>Gallery is empty.</h3>
          </div>
        )}
      </section>
    </>
  );
}
