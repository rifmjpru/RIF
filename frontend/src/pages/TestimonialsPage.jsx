import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

export default function TestimonialsPage() {
  const homepage = useSiteData().siteData?.homepage;
  const testimonials =
    homepage?.testimonials?.length
      ? homepage.testimonials
      : (homepage?.startupStories || []).map((story) => ({
          id: story.id,
          name: story.name,
          role: story.sector,
          quote: story.highlight
        }));
  const section = homepage?.testimonialsSection || {};

  return (
    <>
      <PageHero
        eyebrow={section.pageEyebrow || section.eyebrow || "Testimonials"}
        panelKey="testimonials"
        title={section.pageTitle || section.title || "Voices from the RIF ecosystem"}
        description={
          section.pageDescription ||
          section.description ||
          "Read what founders, members, and ecosystem partners say about their experience with RIF."
        }
        primaryAction={{ label: "Send Enquiry", to: "/enquiry" }}
        secondaryAction={{ label: "Contact RIF", to: "/contact" }}
      />

      <section className="section">
        <div className="card-grid card-grid-3">
          {testimonials.map((testimonial) => (
            <article className="content-card testimonial-card" key={testimonial.id || testimonial.name}>
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <h3>{testimonial.name}</h3>
              <p className="detail-line">{testimonial.role}</p>
            </article>
          ))}
        </div>
        {!testimonials.length ? (
          <article className="content-card">
            <h3>No testimonials added yet</h3>
            <p>The admin dashboard can publish testimonials here anytime.</p>
            <Link className="button" to="/enquiry">
              Send Enquiry
            </Link>
          </article>
        ) : null}
      </section>
    </>
  );
}
