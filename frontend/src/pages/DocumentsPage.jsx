import { useSiteData } from "../components/SiteDataProvider.jsx";
import { API_ORIGIN } from "../api/client.js";

const resolveDocumentUrl = (value = "") => {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_ORIGIN}${value}`;
  }

  return `${API_ORIGIN}/${value}`;
};

export default function DocumentsPage() {
  const about = useSiteData().siteData?.about;
  const documents = about?.documents || [];

  return (
    <>
      <section className="section docs-simple-section" id="documents">
        <div className="docs-simple-heading">
          <span aria-hidden className="docs-simple-accent" />
          <h1>Documents</h1>
        </div>
        <div className="docs-simple-grid">
          {documents.length ? (
            documents.map((document) => (
              <article className="docs-simple-card" key={document.id}>
                <h3>{document.title}</h3>
                {document.url ? (
                  <a className="docs-simple-view" href={resolveDocumentUrl(document.url)} rel="noreferrer" target="_blank">
                    View
                  </a>
                ) : (
                  <p className="muted-copy">PDF not uploaded yet.</p>
                )}
              </article>
            ))
          ) : (
            <article className="docs-simple-card">
              <h3>No documents added yet.</h3>
              <p className="muted-copy">Add documents from the admin dashboard.</p>
            </article>
          )}
        </div>
      </section>
    </>
  );
}
