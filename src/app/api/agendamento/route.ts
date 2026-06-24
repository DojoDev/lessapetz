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

    const customerRepo = new PostgresCustomerRepository();
    const petRepo = new PostgresPetRepository();
    const bookingRepo = new PostgresBookingRepository();

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
