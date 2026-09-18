import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrencyBRL } from '../utils/formatters';
import { X, Sparkles, CheckCircle2, MessageCircle, Plus, Minus, ShoppingBag, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  whatsappNumber?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  whatsappNumber = '5524999999999',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedEffect, setAddedEffect] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedEffect(true);
    setTimeout(() => {
      setAddedEffect(false);
      onClose();
    }, 700);
  };

  const handleDirectWhatsApp = () => {
    const totalVal = formatCurrencyBRL(product.price * quantity);
    const msg = encodeURIComponent(
      `Olá, Alfajoraria Andrey! Gostaria de encomendar ${quantity}x *${product.name}* (Total: ${totalVal}). Como está a disponibilidade de entrega hoje?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
  };

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-content"
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#E8DEC7] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo with badges and Close */}
        <div className="relative aspect-[16/10] bg-[#F2EDE2] shrink-0 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          <button
            id="modal-close-button"
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-[#2B1810] rounded-full shadow-md backdrop-blur-xs transition cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {product.category && (
              <span className="bg-[#3B2011]/90 text-[#FAF7F2] text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs shadow-xs">
                {product.category}
              </span>
            )}
            {product.badge && (
              <span className="bg-[#E2C799] text-[#2B1810] text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif-brand text-xl sm:text-2xl font-bold text-[#2B1810] leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {product.available ? 'Disponível na fornada de hoje' : 'Esgotado temporariamente'}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="block font-sans text-xl font-extrabold text-[#3B2011]">
                {formatCurrencyBRL(product.price)}
              </span>
              <span className="text-[11px] text-[#8C735F]">unidade</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#735A47] mb-1">
              Sobre a receita artesanal
            </h4>
            <p className="text-sm text-[#5C4535] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Ingredients list */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EDE4D2]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#735A47] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A26D3F]" />
                Ingredientes Selecionados
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4A382A]">
                {product.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B88A58] shrink-0"></span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-[#9E8B7A] mt-3 border-t border-[#E8DFC8] pt-2">
                * Contém glúten e derivados de leite. Pode conter traços de nozes e castanhas.
              </p>
            </div>
          )}

          {/* Quantity Controls & Subtotal */}
          {product.available && (
            <div className="bg-[#F8F4EC] p-3.5 rounded-2xl border border-[#EBE1CF] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#3B2011] block">Quantidade</span>
                <span className="text-xs font-bold text-[#8C5D38]">
                  Total: {formatCurrencyBRL(product.price * quantity)}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-xl border border-[#DAC9B3] p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5EFE6] text-[#3B2011] transition"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-extrabold text-[#2B1810]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5EFE6] text-[#3B2011] transition"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              id="modal-add-to-cart-btn"
              type="button"
              disabled={!product.available}
              onClick={handleAdd}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                !product.available
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : addedEffect
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2]'
              }`}
            >
              {addedEffect ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Item Adicionado ao Carrinho!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#E2C799]" />
                  <span>Adicionar ao Pedido ({formatCurrencyBRL(product.price * quantity)})</span>
                </>
              )}
            </button>

            <button
              id="modal-direct-whatsapp-btn"
              type="button"
              onClick={handleDirectWhatsApp}
              className="w-full py-2.5 px-4 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#1B803E] border border-[#25D366]/40 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pedir Direto no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
