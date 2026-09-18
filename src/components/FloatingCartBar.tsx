import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrencyBRL } from '../utils/formatters';

interface FloatingCartBarProps {
  totalCount: number;
  totalPrice: number;
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  totalCount,
  totalPrice,
  onOpenCart,
}) => {
  const safeCount = Math.max(0, Math.floor(Number(totalCount) || 0));
  const safePrice = isNaN(Number(totalPrice)) ? 0 : Number(totalPrice);

  if (safeCount <= 0) return null;

  return (
    <aside
      aria-label="Resumo do pedido atual"
      className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-fade-in"
    >
      <button
        id="floating-cart-bar-btn"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenCart();
        }}
        className="w-full bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2] p-3.5 rounded-2xl shadow-xl border border-[#E2C799]/40 flex items-center justify-between transition-all transform active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-[#E2C799] text-[#2B1810] flex items-center justify-center font-bold text-sm shadow-xs">
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#D9534F] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#3B2011]">
              {safeCount}
            </span>
          </div>

          <div className="text-left">
            <p className="text-xs font-bold leading-tight">Ver Meu Pedido</p>
            <p className="text-[11px] text-[#D4BCA3]">
              {safeCount} {safeCount === 1 ? 'item adicionado' : 'itens adicionados'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-sans font-extrabold text-sm sm:text-base text-[#FAF7F2]">
            {formatCurrencyBRL(safePrice)}
          </span>
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-[#E2C799]" />
          </div>
        </div>
      </button>
    </aside>
  );
};
