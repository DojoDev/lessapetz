export type SizeCategory = 'small' | 'medium' | 'large' | 'giant';

export type CoatType =
  | 'short'
  | 'medium'
  | 'long'
  | 'double'
  | 'curly';

export type Behavior =
  | 'calm'
  | 'fearful'
  | 'hyperactive'
  | 'aggressive'
  | 'special_handling';

export interface Pet {
  id: string;
  tenantId: string;
  customerId: string;
  name: string;
  breed: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  weight: number | null;
  sizeCategory: SizeCategory;
  coatType: CoatType | null;
  behavior: Behavior | null;
  healthNotes: string | null;
  createdAt: Date;
}
