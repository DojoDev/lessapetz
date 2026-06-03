import Header from "@/presentation/components/Header";
import SocialLinks from "@/presentation/components/SocialLinks";
import Catalog from "@/presentation/components/Catalog";
import FAQAccordion from "@/presentation/components/FAQAccordion";
import Footer from "@/presentation/components/Footer";

import { StaticCatalogRepository } from "@/infra/repositories/StaticCatalogRepository";
import { StaticFAQRepository } from "@/infra/repositories/StaticFAQRepository";
import { GetCatalog } from "@/usecases/GetCatalog";
import { GetFAQs } from "@/usecases/GetFAQs";

export default async function Home() {
  // Instantiate concrete repositories (Infra Layer)
  const catalogRepo = new StaticCatalogRepository();
  const faqRepo = new StaticFAQRepository();

  // Instantiate Use Cases (Use Cases Layer)
  const getCatalog = new GetCatalog(catalogRepo);
  const getFAQs = new GetFAQs(faqRepo);

  // Retrieve datasets (Domain Entities)
  const { services, courses } = await getCatalog.execute();
  const faqs = await getFAQs.execute();

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream text-stone-800">
      {/* Brand banner and badge overlay */}
      <Header />
      
      {/* Central content zone */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:py-10">
        {/* Floating social profiles & prominent quick contact bubble */}
        <SocialLinks />
        
        {/* Interactive service list & professional school courses catalog */}
        <Catalog services={services} courses={courses} />
        
        {/* Interactive frequently asked questions block */}
        <FAQAccordion faqs={faqs} />
      </main>

      {/* Corporate address, details, and schedule footer */}
      <Footer />
    </div>
  );
}
