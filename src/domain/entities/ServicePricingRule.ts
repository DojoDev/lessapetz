export interface ServicePricingRule {
  id: string;
  serviceId: string;
  sizeCategory: string | null;
  coatType: string | null;
  breed: string | null;
  priceModifier: number;
  durationModifierMin: number;
}
