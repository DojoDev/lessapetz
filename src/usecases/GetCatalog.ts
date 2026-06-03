import { CatalogRepository } from "@/domain/repositories/CatalogRepository";

export class GetCatalog {
  constructor(private catalogRepo: CatalogRepository) {}

  async execute() {
    const services = await this.catalogRepo.getServices();
    const courses = await this.catalogRepo.getCourses();
    return { services, courses };
  }
}
