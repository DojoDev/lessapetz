export interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  createdAt: Date;
}
