import { FAQRepository } from "@/domain/repositories/FAQRepository";
import { FAQ } from "@/domain/entities/FAQ";

export class StaticFAQRepository implements FAQRepository {
  private faqs: FAQ[] = [
    {
      id: "faq-1",
      question: "Como faço para agendar um banho ou tosa?",
      answer: "Para agendar, basta escolher o serviço desejado no nosso catálogo acima e clicar no botão 'Agendar via WhatsApp'. Você será redirecionado para o nosso chat com uma mensagem pronta contendo o serviço selecionado. Nossa equipe confirmará o dia e horário de sua preferência.",
      category: "Serviços",
    },
    {
      id: "faq-2",
      question: "Quais são os pré-requisitos para fazer os cursos?",
      answer: "Para o curso Iniciante (Formação completa), não é exigida nenhuma experiência prévia no ramo pet, apenas amor pelos animais! Para os cursos de especialização (Tosa na Tesoura e Especialização em Raças), é recomendado possuir conhecimento básico ou experiência com banho e tosa em máquina.",
      category: "Cursos",
    },
    {
      id: "faq-3",
      question: "Os cursos oferecem prática em cães reais?",
      answer: "Sim! Nosso método é focado na prática real. A escola disponibiliza modelos animais reais para que cada aluno realize os banhos, tosas e escovações individualmente sob a supervisão constante de nossos instrutores experientes.",
      category: "Cursos",
    },
    {
      id: "faq-4",
      question: "A escola fornece os materiais para as aulas?",
      answer: "Durante o período do curso, a Lessa Petz disponibiliza todos os equipamentos pesados como sopradores, secadores, banheiras e cosméticos profissionais. Para os equipamentos individuais (tesouras, máquinas e lâminas), orientamos nossos alunos no primeiro dia de aula sobre kits recomendados com descontos especiais de parceiros.",
      category: "Cursos",
    },
    {
      id: "faq-5",
      question: "Os certificados são reconhecidos?",
      answer: "Sim, todos os nossos alunos graduados recebem um certificado profissional com validade nacional emitido pela Lessa Petz Escola de Banho e Tosa, amplamente reconhecido no mercado pet nacional pela qualidade do ensino.",
      category: "Geral",
    },
    {
      id: "faq-6",
      question: "Quais as formas de pagamento aceitas?",
      answer: "Para os serviços de estética, aceitamos Pix, dinheiro e cartões de débito/crédito. Para as matrículas nos cursos, facilitamos o pagamento parcelado em até 10x sem juros no cartão de crédito ou concedemos desconto especial para pagamento à vista no Pix.",
      category: "Geral",
    },
  ];

  async getFAQs(): Promise<FAQ[]> {
    return this.faqs;
  }
}
