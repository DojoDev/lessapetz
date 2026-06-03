export class GetWhatsAppUrl {
  private baseNumber: string;

  constructor() {
    const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5519992938321";
    // Sanitize phone number (strip all non-digit characters)
    this.baseNumber = rawNumber.replace(/\D/g, "");
  }

  executeForService(serviceTitle: string, servicePrice: string): string {
    let priceText = servicePrice;
    if (servicePrice.toLowerCase().includes("consultar")) {
      priceText = "valor a consultar";
    } else if (servicePrice.toLowerCase().includes("a partir")) {
      if (!servicePrice.includes("R$")) {
        priceText = servicePrice.replace(/a partir de\s*/i, "A partir de R$ ");
      }
    } else if (!servicePrice.includes("R$")) {
      priceText = `R$ ${servicePrice}`;
    }
    const text = `Olá! Gostaria de agendar o serviço de Estética Pet: *${serviceTitle}* (Valor: ${priceText}). Como posso marcar um horário?`;
    return `https://wa.me/${this.baseNumber}?text=${encodeURIComponent(text)}`;
  }

  executeForCourse(courseTitle: string, coursePrice: string): string {
    const text = `Olá! Tenho interesse em me matricular no curso profissionalizante: *${courseTitle}* (Investimento: ${coursePrice}). Gostaria de receber mais informações sobre turmas e datas.`;
    return `https://wa.me/${this.baseNumber}?text=${encodeURIComponent(text)}`;
  }

  executeGeneralContact(): string {
    const text = `Olá! Gostaria de tirar algumas dúvidas sobre os serviços e cursos da Lessa Petz.`;
    return `https://wa.me/${this.baseNumber}?text=${encodeURIComponent(text)}`;
  }
}
