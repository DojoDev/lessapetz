"use client";

import { useSearchParams } from "next/navigation";
import GamifiedBookingForm from "./GamifiedBookingForm";
import { PetService } from "@/domain/entities/PetService";
import { Suspense } from "react";

interface Props {
  services: any[];
}

function ModalContent({ services }: Props) {
  const searchParams = useSearchParams();
  const isBookingModalOpen = searchParams.get("booking") === "true";

  if (!isBookingModalOpen) return null;

  return <GamifiedBookingForm services={services} />;
}

export default function BookingModalContainer({ services }: Props) {
  return (
    <Suspense fallback={null}>
      <ModalContent services={services} />
    </Suspense>
  );
}
