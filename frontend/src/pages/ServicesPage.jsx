import { PageHero } from "../components/PageHero.jsx";
import { useSiteData } from "../components/SiteDataProvider.jsx";

export default function ServicesPage() {
  const services = useSiteData().siteData?.services;

  return (
    <>
      <PageHero
        eyebrow="Services"
        panelKey="services"
        title="Incubation and business support services for founder momentum."
        description="This page captures core services as a structured, editable collection."
        primaryAction={{ label: "Send Enquiry", to: "/enquiry" }}
        secondaryAction={{ label: "View Leadership", to: "/leadership" }}
      />
      <section className="section">
        <div className="card-grid card-grid-3">
          {services?.map((service) => (
            <article className="content-card" key={service.id}>
              <p className="meta-line">
                <span>{service.category}</span>
              </p>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul className="bullet-list bullet-list-tight">
                {service.items?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
