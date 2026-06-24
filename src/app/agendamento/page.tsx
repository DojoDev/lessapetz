import Header from "@/presentation/components/Header";
import Footer from "@/presentation/components/Footer";
import GamifiedBookingForm from "@/presentation/components/GamifiedBookingForm";
import { StaticCatalogRepository } from "@/infra/repositories/StaticCatalogRepository";
import { GetCatalog } from "@/usecases/GetCatalog";

export const metadata = {
  title: "Agendamento - Lessa Petz",
  description: "Agende o banho ou tosa do seu pet de forma rápida e prática.",
};

export default async function AgendamentoPage() {
  const catalogRepo = new StaticCatalogRepository();
  const getCatalog = new GetCatalog(catalogRepo);
  const { services } = await getCatalog.execute();

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-800">
      <Header hideBookingButton={true} />
      
      <main className="flex-1 w-full max-w-5xl mx-auto py-12 px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-burgundy mb-4">
            Vamos cuidar do seu Pet?
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            Preencha os dados abaixo de forma rápida e garanta um horário com os melhores profissionais.
          </p>
        </div>

        <GamifiedBookingForm services={services} />
      </main>

      <Footer />
    </div>
  );
}
