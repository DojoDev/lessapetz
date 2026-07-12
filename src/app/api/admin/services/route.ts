import { NextResponse } from 'next/server';
import { StaticCatalogRepository } from '../../../../infra/repositories/StaticCatalogRepository';

const catalogRepo = new StaticCatalogRepository();

export async function GET() {
  try {
    const services = await catalogRepo.getServices();
    // parse price to number for the modal
    const parsedServices = services.map(s => {
      // Very basic price parsing to extract numeric value
      const numMatch = s.price.match(/[\d,.]+/);
      let numericPrice = 0;
      if (numMatch) {
        numericPrice = parseFloat(numMatch[0].replace('.', '').replace(',', '.'));
      }
      
      // parse duration to minutes
      let durationMin = 60; // default
      if (s.duration.includes('120')) durationMin = 120;
      else if (s.duration.includes('90')) durationMin = 90;
      else if (s.duration === 'Mensal') durationMin = 0;

      return {
        ...s,
        price: numericPrice,
        durationMin
      };
    });
    return NextResponse.json(parsedServices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
