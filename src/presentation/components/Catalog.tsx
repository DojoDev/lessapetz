"use client";

import { useState, useMemo } from "react";
import { Service } from "@/domain/entities/Service";
import { Course } from "@/domain/entities/Course";
import { GetWhatsAppUrl } from "@/usecases/GetWhatsAppUrl";
import CardItem from "./CardItem";

interface CatalogProps {
  services: Service[];
  courses: Course[];
}

type TabType = "services" | "courses";

export default function Catalog({ services, courses }: CatalogProps) {
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const getWhatsAppUrl = useMemo(() => new GetWhatsAppUrl(), []);

  // Define categories based on active tab
  const categories = useMemo(() => {
    if (activeTab === "services") {
      const cats = new Set(services.map((s) => s.category));
      return ["Todos", ...Array.from(cats)];
    } else {
      const cats = new Set(courses.map((c) => c.category));
      return ["Todos", ...Array.from(cats)];
    }
  }, [activeTab, services, courses]);

  // Reset category filter when active tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setActiveCategory("Todos");
    setSearchTerm("");
  };

  // Filter items based on active tab, category, and search term
  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (activeTab === "services") {
      return services.filter((s) => {
        const matchesCategory = activeCategory === "Todos" || s.category === activeCategory;
        const matchesSearch =
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      });
    } else {
      return courses.filter((c) => {
        const matchesCategory = activeCategory === "Todos" || c.category === activeCategory;
        const matchesSearch =
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      });
    }
  }, [activeTab, activeCategory, searchTerm, services, courses]);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8 select-none">
      {/* Search and Tab Selector Navigation Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl shadow-sm mb-8 border border-brand-gold/15 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Tab Controls */}
        <div className="flex bg-brand-cream-dark p-1 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => handleTabChange("services")}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === "services"
                ? "bg-brand-burgundy text-white shadow-md"
                : "text-stone-600 hover:text-brand-burgundy"
            }`}
          >
            ✂️ Estética Pet
          </button>
          <button
            onClick={() => handleTabChange("courses")}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === "courses"
                ? "bg-brand-burgundy text-white shadow-md"
                : "text-stone-600 hover:text-brand-burgundy"
            }`}
          >
            🎓 Nossos Cursos
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4.5 w-4.5 text-stone-400 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={activeTab === "services" ? "Buscar serviços de estética..." : "Buscar cursos de banho & tosa..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-gold text-xs sm:text-sm bg-white/70 font-sans placeholder-stone-400 text-stone-800 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8 animate-fade-in">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
              activeCategory === category
                ? "bg-brand-gold text-white border-brand-gold shadow-sm scale-105"
                : "bg-white text-stone-500 border-stone-200 hover:border-brand-gold hover:text-brand-gold"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Interactive Catalog Cards Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-slide-up">
          {filteredItems.map((item) => {
            const whatsAppUrl =
              activeTab === "services"
                ? getWhatsAppUrl.executeForService(item.title, item.price)
                : getWhatsAppUrl.executeForCourse(item.title, item.price);

            return (
              <CardItem
                key={item.id}
                item={item}
                type={activeTab === "services" ? "service" : "course"}
                whatsAppUrl={whatsAppUrl}
              />
            );
          })}
        </div>
      ) : (
        <div className="w-full text-center py-16 px-4 glass-panel rounded-3xl border border-brand-gold/10">
          <p className="text-stone-500 font-sans text-sm sm:text-base font-light">
            Nenhum item encontrado com os termos de busca selecionados. 🐾
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setActiveCategory("Todos");
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-gold/10 text-brand-gold-dark border border-brand-gold/20 hover:bg-brand-gold/20 transition-all duration-300"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Informações Importantes / Disclaimer */}
      {activeTab === "services" && (
        <div className="mt-12 glass-panel-dark p-6 sm:p-8 rounded-3xl border border-brand-burgundy/10 animate-slide-up flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 text-stone-700">
          <div className="w-12 h-12 rounded-2xl bg-brand-burgundy/10 flex items-center justify-center shrink-0 mx-auto md:mx-0">
            <span className="text-xl">💡</span>
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h4 className="font-serif font-bold text-brand-burgundy text-sm sm:text-base uppercase tracking-wider">
              Informações Importantes
            </h4>
            <div className="font-sans text-xs sm:text-sm font-light leading-relaxed text-stone-600 space-y-1">
              <p>🐾 Os valores de todos os banhos listados já incluem a <strong>tosa higiênica</strong>.</p>
              <p>🐾 Para animais de <strong>raças específicas</strong> e <strong>pelagens compridas ou longas</strong>, consulte o valor.</p>
              <p>🐾 O serviço de <strong>desembolo de pelagem</strong> é cobrado à parte, conforme a necessidade avaliada pelo profissional.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
