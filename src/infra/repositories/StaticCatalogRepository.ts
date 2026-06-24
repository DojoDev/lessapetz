import { CatalogRepository } from "@/domain/repositories/CatalogRepository";
import { Service } from "@/domain/entities/Service";
import { Course } from "@/domain/entities/Course";

export class StaticCatalogRepository implements CatalogRepository {
  private services: Service[] = [
    {
      id: "srv-banho-peq",
      title: "Banho & Tosa Higiênica - Porte Pequeno",
      category: "Banhos",
      description: "Banho completo com tosa higiênica inclusa. Indicado para cães de porte pequeno com pelagem curta e média. Pelagens longas sob consulta.",
      duration: "60 min",
      price: "A partir de 65,00",
    },
    {
      id: "srv-banho-med",
      title: "Banho & Tosa Higiênica - Porte Médio",
      category: "Banhos",
      description: "Banho completo com tosa higiênica inclusa. Indicado para cães de porte médio. Pelagens longas sob consulta.",
      duration: "60 min",
      price: "A partir de 80,00",
    },
    {
      id: "srv-banho-gra",
      title: "Banho & Tosa Higiênica - Porte Grande",
      category: "Banhos",
      description: "Banho completo com tosa higiênica inclusa. Indicado para cães de porte grande. Pelagens longas sob consulta.",
      duration: "90 min",
      price: "A partir de 110,00",
    },
    {
      id: "srv-banho-racas",
      title: "Banho - Raças Específicas",
      category: "Banhos",
      description: "Banho completo com tosa higiênica inclusa. Adaptado para raças específicas (ex: Spitz Alemão, Chow Chow, etc.). Pelagens longas sob consulta.",
      duration: "90 min",
      price: "A partir de 140,00",
    },
    {
      id: "srv-tosa-maq-peq",
      title: "Tosa na Máquina - Porte Pequeno",
      category: "Tosas",
      description: "Tosa completa realizada na máquina para cães de porte pequeno. Inclui banho completo e tosa higiênica.",
      duration: "90 min",
      price: "110,00",
    },
    {
      id: "srv-tosa-maq-med",
      title: "Tosa na Máquina - Porte Médio",
      category: "Tosas",
      description: "Tosa completa realizada na máquina para cães de porte médio. Inclui banho completo e tosa higiênica.",
      duration: "90 min",
      price: "130,00",
    },
    {
      id: "srv-tosa-maq-gra",
      title: "Tosa na Máquina - Porte Grande",
      category: "Tosas",
      description: "Tosa completa realizada na máquina para cães de porte grande. Inclui banho completo e tosa higiênica.",
      duration: "Consultar",
      price: "Valor a consultar",
    },
    {
      id: "srv-tosa-bebe-peq",
      title: "Tosa Bebê - Porte Pequeno",
      category: "Tosas",
      description: "Corte inteiro feito na tesoura/máquina que deixa o pet com aparência de filhote. Indicado para porte pequeno. Inclui banho completo e tosa higiênica.",
      duration: "120 min",
      price: "120,00",
    },
    {
      id: "srv-tosa-bebe-med",
      title: "Tosa Bebê - Porte Médio",
      category: "Tosas",
      description: "Corte inteiro feito na tesoura/máquina que deixa o pet com aparência de filhote. Indicado para porte médio. Inclui banho completo e tosa higiênica.",
      duration: "120 min",
      price: "140,00",
    },
    {
      id: "srv-tosa-bebe-gra",
      title: "Tosa Bebê - Porte Grande",
      category: "Tosas",
      description: "Corte feito para deixar o pet com aparência de filhote. Indicado para porte grande. Inclui banho completo e tosa higiênica.",
      duration: "Consultar",
      price: "Valor a consultar",
    },
    {
      id: "srv-pacote-peq",
      title: "Pacote Mensal - Porte Pequeno",
      category: "Pacotes",
      description: "Plano mensal contendo 4 banhos, 1 tosa higiênica e 1 hidratação. Indicado para porte pequeno. Pelagens longas e raças específicas sob consulta. Desembolo cobrado à parte.",
      duration: "Mensal",
      price: "200,00",
    },
    {
      id: "srv-pacote-med",
      title: "Pacote Mensal - Porte Médio",
      category: "Pacotes",
      description: "Plano mensal contendo 4 banhos, 1 tosa higiênica e 1 hidratação. Indicado para porte médio. Pelagens longas e raças específicas sob consulta. Desembolo cobrado à parte.",
      duration: "Mensal",
      price: "245,00",
    },
    {
      id: "srv-pacote-gra",
      title: "Pacote Mensal - Porte Grande",
      category: "Pacotes",
      description: "Plano mensal contendo 4 banhos, 1 tosa higiênica e 1 hidratação. Indicado para porte grande. Pelagens longas e raças específicas sob consulta. Desembolo cobrado à parte.",
      duration: "Mensal",
      price: "360,00",
    },
  ];

  private courses: Course[] = [
    {
      id: "crs-iniciante",
      title: "Curso Profissional de Banho e Tosa",
      category: "Formação",
      description: "Aprenda na prática as principais técnicas de banho e tosa para cuidar dos pets com segurança, carinho e profissionalismo. Um curso completo ministrado por uma Médica Veterinária.",
      duration: "80 horas",
      price: "1.500,00",
      level: "Iniciante",
      certificate: "Certificado Profissional com Selo de Excelência Lessa Petz",
    },
    {
      id: "crs-banhista-499",
      title: "Curso Banhista 499",
      category: "Especialização",
      description: "Transforme sua paixão por pets em uma profissão lucrativa com o nosso treinamento prático, direto ao ponto.",
      duration: "Acelerado",
      price: "499,00",
      level: "Iniciante",
      certificate: "Certificado de Conclusão",
    },
  ];

  async getServices(): Promise<Service[]> {
    return this.services;
  }

  async getCourses(): Promise<Course[]> {
    return this.courses;
  }
}
