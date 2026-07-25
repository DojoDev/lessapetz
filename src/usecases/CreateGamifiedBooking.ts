import { CustomerRepository } from "@/domain/repositories/CustomerRepository";
import { PetRepository } from "@/domain/repositories/PetRepository";
import { BookingRepository } from "@/domain/repositories/BookingRepository";
import { Customer } from "@/domain/entities/Customer";
import { Pet, SizeCategory, CoatType, Behavior } from "@/domain/entities/Pet";
import { Booking, BookingStatus } from "@/domain/entities/Booking";

export interface GamifiedBookingDTO {
  tenantId: string;
  customer: {
    fullName: string;
    phone: string;
    email: string | null;
  };
  pet: {
    name: string;
    breed: string | null;
    sizeCategory: SizeCategory;
  };
  booking: {
    serviceId: string;
    startAt: Date;
    paymentMethod?: string;
  };
}

export class CreateGamifiedBooking {
  constructor(
    private customerRepo: CustomerRepository,
    private petRepo: PetRepository,
    private bookingRepo: BookingRepository
  ) {}

  async execute(dto: GamifiedBookingDTO): Promise<{ bookingId: string }> {
    const { tenantId, customer, pet, booking } = dto;

    // 1. Find or create customer
    let existingCustomer: Customer | null = null;
    
    if (customer.email) {
      existingCustomer = await this.customerRepo.findByEmail(tenantId, customer.email);
    }
    
    // Fallback search by phone could be added to CustomerRepository, 
    // but for now, we rely on email if provided. If we don't have it, we just create a new one.
    // Assuming simple creation for gamified flow:
    if (!existingCustomer) {
      existingCustomer = await this.customerRepo.create(tenantId, {
        fullName: customer.fullName,
        cpf: null,
        phone: customer.phone,
        email: customer.email,
        address: null,
        zipCode: null,
        street: null,
        number: null,
        neighborhood: null,
        city: null,
        passwordHash: null,
      });
    }

    // 2. Create Pet
    const newPet = await this.petRepo.create(tenantId, {
      customerId: existingCustomer.id,
      name: pet.name,
      species: 'dog',
      breed: pet.breed,
      sizeCategory: pet.sizeCategory,
      dateOfBirth: null,
      gender: null,
      weight: null,
      coatType: null,
      behavior: null,
      healthNotes: null,
      photoUrl: null,
    });

    // 3. Create Booking
    // We are setting default duration and price. In a real app, this would be computed 
    // or fetched from the Service pricing rules.
    const newBooking = await this.bookingRepo.create(tenantId, {
      customerId: existingCustomer.id,
      petId: newPet.id,
      serviceId: booking.serviceId,
      customerPlanId: null,
      employeeId: null, // to be assigned
      startAt: booking.startAt,
      endAt: new Date(booking.startAt.getTime() + 60 * 60000), // default 1h
      durationMin: 60,
      totalPrice: 100, // default price for gamified form, should be dynamic later
      status: 'SCHEDULED' as BookingStatus,
      notes: "Criado via Agendamento Expresso (Gamificado)",
      paymentMethod: booking.paymentMethod || null,
      paymentStatus: 'pending',
    });

    return { bookingId: newBooking.id };
  }
}
