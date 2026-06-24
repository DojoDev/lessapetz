import { NextRequest, NextResponse } from "next/server";
import { PostgresCustomerRepository } from "@/infra/repositories/PostgresCustomerRepository";
import { PostgresPetRepository } from "@/infra/repositories/PostgresPetRepository";
import { PostgresBookingRepository } from "@/infra/repositories/PostgresBookingRepository";
import { CreateGamifiedBooking, GamifiedBookingDTO } from "@/usecases/CreateGamifiedBooking";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Default tenant for the MVP
    const tenantId = "tenant_1";

    const dto: GamifiedBookingDTO = {
      tenantId,
      customer: {
        fullName: body.customer.fullName,
        phone: body.customer.phone,
        email: body.customer.email || null,
      },
      pet: {
        name: body.pet.name,
        breed: body.pet.breed || null,
        sizeCategory: body.pet.sizeCategory || "small",
      },
      booking: {
        serviceId: body.booking.serviceId,
        startAt: new Date(body.booking.startAt),
      },
    };

    // We need to fetch the single tenant that was created
    const customerRepo = new PostgresCustomerRepository();
    const petRepo = new PostgresPetRepository();
    const bookingRepo = new PostgresBookingRepository();
    
    // Find tenant ID (we just created one in init script, so we'll grab it or use a default if it doesn't exist)
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const tenantRes = await pool.query('SELECT id FROM tenants LIMIT 1');
    const realTenantId = tenantRes.rows.length > 0 ? tenantRes.rows[0].id : "tenant_1";
    dto.tenantId = realTenantId; // Set the real tenant ID

    const createBookingUseCase = new CreateGamifiedBooking(customerRepo, petRepo, bookingRepo);
    
    const result = await createBookingUseCase.execute(dto);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating gamified booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
