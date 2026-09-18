import React from 'react';
import { Search, Clock, Phone, MessageCircle, ShoppingBag, Sparkles, Package, X } from 'lucide-react';
import { LogoAndrey } from './LogoAndrey';
import { StoreSettings } from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/storeSettings';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  settings?: StoreSettings;
  cartTotalCount: number;
  onOpenCart: () => void;
  onOpenBoxBuilder: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  settings,
  cartTotalCount,
  onOpenCart,
  onOpenBoxBuilder,
}) => {
  const currentSettings = settings || INITIAL_STORE_SETTINGS;

  return (
    <header className="w-full bg-[#FAF7F2] border-b border-[#E8DFC8]/70 pt-3 pb-4">
      {/* Top Banner */}
      {currentSettings.announcement && (
        <div className="bg-[#3B2011] text-[#FAF7F2] text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#E2C799]" />
          <span>{currentSettings.announcement}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-3">
        {/* Upper Badges & Quick Cart button */}
        <div className="flex items-center justify-between text-xs text-[#7A6250] mb-2">
          <div className="flex items-center gap-1.5 bg-[#F2ECE1] px-2.5 py-1 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{currentSettings.isOpen ? 'Ateliê Aberto' : 'Ateliê Fechado'}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-[#8C735F] bg-[#F7F2EA] px-2.5 py-1 rounded-full border border-[#E8DEC7]">
              <Clock className="w-3.5 h-3.5 text-[#9E6D3B]" />
              <span className="font-medium">{currentSettings.openingHours}</span>
            </div>

            <button
              id="header-cart-button"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenCart();
              }}
              className="relative p-2 bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2] rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              aria-label="Abrir carrinho"
            >
              <ShoppingBag className="w-4 h-4 text-[#E2C799]" />
              <span className="text-xs font-bold hidden sm:inline">Carrinho</span>
              {cartTotalCount > 0 && (
                <span className="bg-[#D9534F] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Brand Center */}
        <div className="text-center my-3">
          <div className="inline-flex items-center justify-center mb-2">
            <LogoAndrey className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-md hover:scale-105 transition-transform duration-300 border border-[#E2D6C0]" />
          </div>

          <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold tracking-tight text-[#2B1810]">
            Alfajoraria Andrey
          </h1>

          <p className="text-xs uppercase tracking-[0.22em] text-[#8C735F] font-bold mt-0.5">
            Alfajores Artesanais • Onde nasce o sabor!
          </p>

          <p className="text-xs text-[#6B5545] max-w-md mx-auto mt-2 leading-relaxed">
            Alfajores produzidos artesanalmente com doce de leite mineiro cremoso, cobertura de chocolate de alta qualidade e insumos selecionados!
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
            <a
              id="header-whatsapp-link"
              href={`https://wa.me/${currentSettings.whatsapp}?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20os%20alfajores%20artesanais`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#1B803E] border border-[#25D366]/35 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>(24) 99262-0792</span>
            </a>

            <button
              id="header-box-builder-btn"
              type="button"
              onClick={onOpenBoxBuilder}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E2C799] hover:bg-[#D6B782] text-[#2B1810] border border-[#C5A574] rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-[#3B2011]" />
              <span>Monte Sua Caixa com Sabores</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C735F]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="menu-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar sabor, recheio ou ingrediente (ex: pistache, nozes, belga)..."
            className="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl border border-[#E2D6C0] text-sm text-[#2D241E] placeholder-[#9E8B7A] focus:outline-none focus:ring-2 focus:ring-[#784627] focus:border-transparent transition shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C735F] hover:text-[#2B1810]"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
          <button
            id="cat-btn-all"
            type="button"
            onClick={() => onCategoryChange('Todos')}
            className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'Todos'
                ? 'bg-[#3B2011] text-[#FAF7F2] shadow-xs'
                : 'bg-white border border-[#E5DAC6] text-[#5C4535] hover:bg-[#F4EFE6]'
            }`}
          >
            Todos os Alfajores
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-btn-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#3B2011] text-[#FAF7F2] shadow-xs'
                  : 'bg-white border border-[#E5DAC6] text-[#5C4535] hover:bg-[#F4EFE6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
