"use client";

import { useState } from 'react';
import NewBookingModal from './NewBookingModal';

export default function NewBookingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="ml-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-lg shadow-sm transition-colors"
      >
        Novo Agendamento
      </button>
      {isOpen && <NewBookingModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
