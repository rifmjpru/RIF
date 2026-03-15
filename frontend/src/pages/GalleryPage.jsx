import { useSiteData } from "../components/SiteDataProvider.jsx";
import { resolveMediaUrl } from "../utils/media.js";

export default function GalleryPage() {
  const gallery = useSiteData().siteData?.gallery;

  return (
    <>
      <section className="section gallery-simple-section">
        <div className="gallery-simple-heading">
          <span aria-hidden className="gallery-simple-accent" />
          <h1>Image Gallery</h1>
        </div>
        {gallery?.length ? (
          <div className="gallery-simple-grid">
            {gallery.map((item) => (
              <article className="gallery-simple-card" key={item.id}>
                <img
                  alt={item.altText || item.title}
                  className="gallery-simple-image"
                  src={resolveMediaUrl(item.imageUrl, item.title)}
                />
                {item.title ? <p className="gallery-simple-caption">{item.title}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Gallery is empty.</h3>
          </div>
        )}
      </section>
    </>
  );
}
