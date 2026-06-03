import { FAQ } from "../entities/FAQ";

export interface FAQRepository {
  getFAQs(): Promise<FAQ[]>;
}
