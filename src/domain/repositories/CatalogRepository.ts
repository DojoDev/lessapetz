import { Service } from "../entities/Service";
import { Course } from "../entities/Course";

export interface CatalogRepository {
  getServices(): Promise<Service[]>;
  getCourses(): Promise<Course[]>;
}
