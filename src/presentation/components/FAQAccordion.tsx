"use client";

import { useState } from "react";
import { FAQ } from "@/domain/entities/FAQ";

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 select-none">
      {/* Title Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
          Dúvidas Frequentes
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-burgundy mt-1">
          Perguntas Frequentes
        </h2>
        <div className="w-12 h-0.5 bg-brand-gold mx-auto mt-3" />
      </div>

      {/* Accordion List */}
      <div className="flex flex-col gap-4 animate-fade-in">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl bg-white border border-brand-gold/15 shadow-sm overflow-hidden transition-all duration-300 hover:border-brand-gold/30"
            >
              {/* Question Header Button */}
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none group"
              >
                <span className="font-serif text-sm sm:text-base font-bold text-stone-800 group-hover:text-brand-burgundy transition-colors duration-300">
                  {faq.question}
                </span>
                
                {/* Gold rotating chevron icon */}
                <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-brand-cream-dark flex items-center justify-center text-brand-gold group-hover:text-brand-burgundy group-hover:bg-brand-gold/10 transition-all duration-300 ${
                  isOpen ? "rotate-180 bg-brand-gold/15 text-brand-burgundy" : ""
                }`}>
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>

              {/* Animated Answer Panel */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-60 border-t border-dashed border-stone-200" : "max-h-0"
              }`}>
                <div className="p-5 sm:p-6 font-sans text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
