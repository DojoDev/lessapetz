import { CatalogRepository } from "@/domain/repositories/CatalogRepository";
import { Service } from "@/domain/entities/Service";
import { Course } from "@/domain/entities/Course";
import pool from "../database/pool";

/**
 * Reads active services from the database (replacing StaticCatalogRepository).
 * Courses remain static since there's no CRUD for them yet.
 */
export class PostgresCatalogRepository implements CatalogRepository {

  private tenantSlug: string;

  constructor(tenantSlug: string = 'lessapetz') {
    this.tenantSlug = tenantSlug;
  }

  async getServices(): Promise<Service[]> {
    const res = await pool.query(
      `SELECT s.*, sc.name as category_name, sc.image_url as category_image_url
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       JOIN tenants t ON s.tenant_id = t.id
       WHERE t.slug = $1 AND s.is_active = true
       ORDER BY sc.display_order ASC, s.display_order ASC, s.name ASC`,
      [this.tenantSlug]
    );

    return res.rows.map(row => this.mapToService(row));
  }

  async getCourses(): Promise<Course[]> {
    // Courses remain static for now — no CRUD implemented yet
    return [
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
  }

  private mapToService(row: any): Service {
    const basePrice = parseFloat(row.base_price);
    const isStartingPrice = row.is_starting_price ?? false;
    const durationMin = row.base_duration_min;

    // Format price string for display
    let priceStr: string;
    if (basePrice === 0) {
      priceStr = "Valor a consultar";
    } else {
      const formatted = basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      priceStr = isStartingPrice ? `A partir de ${formatted}` : formatted;
    }

    // Format duration string
    let durationStr: string;
    if (durationMin === 0) {
      durationStr = "Mensal";
    } else if (durationMin >= 60) {
      durationStr = `${durationMin} min`;
    } else {
      durationStr = `${durationMin} min`;
    }

    // Resolve image: service image > category default image > null
    const imageUrl = row.image_url || row.category_image_url || null;

    return {
      id: row.id,
      title: row.name,
      category: row.category_name || "Sem categoria",
      description: row.description || "",
      duration: durationStr,
      price: priceStr,
      imageUrl: imageUrl,
      petSizeApplicability: row.pet_size_applicability ?? 'all',
    };
  }
}
