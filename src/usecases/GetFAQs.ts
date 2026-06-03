import { FAQRepository } from "@/domain/repositories/FAQRepository";

export class GetFAQs {
  constructor(private faqRepo: FAQRepository) {}

  async execute() {
    return await this.faqRepo.getFAQs();
  }
}
