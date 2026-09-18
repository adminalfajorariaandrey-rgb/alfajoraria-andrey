import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrencyBRL } from '../utils/formatters';
import { Info, Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.available) return;
    onAddToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <article
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-2xl border border-[#EBE3D3] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Photo Container */}
      <div className="relative aspect-[16/10] w-full bg-[#F3EFE6] overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Availability Badge */}
        {!product.available && (
          <div className="absolute inset-0 bg-[#2D241E]/65 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-900/90 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
              Esgotado Hoje
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[85%]">
          {product.category && (
            <span className="bg-[#FAF7F2]/95 backdrop-blur-xs text-[#5C4230] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-[#E5DAC6]/80">
              {product.category}
            </span>
          )}
          {product.badge && (
            <span className="bg-[#E2C799] text-[#2B1810] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Quick hint badge */}
        <div className="absolute bottom-2.5 right-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <span className="inline-flex items-center gap-1 bg-[#3B2011]/85 text-[#FAF7F2] text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs font-medium">
            <Info className="w-3 h-3 text-[#E2C799]" />
            <span>Detalhes</span>
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Name and Price */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h2 className="font-serif-brand text-base sm:text-lg font-bold text-[#2B1810] leading-snug group-hover:text-[#663619] transition-colors line-clamp-2">
            {product.name}
          </h2>
          <span className="font-sans text-sm sm:text-base font-extrabold text-[#3B2011] bg-[#F7F2E7] px-2.5 py-1 rounded-lg shrink-0 border border-[#E8DFC8]">
            {formatCurrencyBRL(product.price)}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-xs text-[#6B5545] line-clamp-2 leading-relaxed mb-3">
          {product.description}
        </p>

        {/* Ingredients Preview */}
        {product.ingredients && product.ingredients.length > 0 && (
          <div className="mt-auto pt-2.5 border-t border-[#F2ECE1]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C735F] block mb-1">
              Ingredientes Nobres:
            </span>
            <div className="flex flex-wrap gap-1">
              {product.ingredients.slice(0, 3).map((ing, idx) => (
                <span
                  key={idx}
                  className="bg-[#F8F4EC] text-[#594435] text-[11px] px-2 py-0.5 rounded-md border border-[#EFE8DA]"
                >
                  {ing}
                </span>
              ))}
              {product.ingredients.length > 3 && (
                <span className="text-[10px] text-[#8C735F] self-center px-1 font-semibold">
                  +{product.ingredients.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Add Button */}
        <div className="mt-3.5 pt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="text-xs font-semibold text-[#663619] hover:underline"
          >
            Ver receita completa
          </button>

          <button
            id={`quick-add-btn-${product.id}`}
            type="button"
            disabled={!product.available}
            onClick={handleQuickAdd}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              !product.available
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2] shadow-xs'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Adicionado!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-[#E2C799]" />
                <span>Pedir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
