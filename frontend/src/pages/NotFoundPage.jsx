import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="empty-state">
        <p className="section-eyebrow">404</p>
        <h1>That page does not exist.</h1>
        <p>The route is missing or the content has moved.</p>
        <Link className="button" to="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}

