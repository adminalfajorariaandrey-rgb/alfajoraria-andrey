import React, { useState, useMemo } from 'react';
import { Product, CustomBoxItem, StoreSettings } from '../types';
import { formatCurrencyBRL } from '../utils/formatters';
import { X, Package, Sparkles, Plus, Minus, Check, Heart } from 'lucide-react';

interface BoxBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddBoxToCart: (box: CustomBoxItem) => void;
  settings?: StoreSettings;
}

const DEFAULT_BOX_DATA: Record<4 | 6 | 12, { defaultPrice: number; name: string; image: string }> = {
  4: {
    defaultPrice: 62.00,
    name: 'Caixa de Alfajores (4 Unidades)',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
  },
  6: {
    defaultPrice: 89.00,
    name: 'Caixa Seleção Especial (6 Unidades)',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  },
  12: {
    defaultPrice: 169.00,
    name: 'Caixa Coleção Completa (12 Unidades)',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
  },
};

const RIBBON_OPTIONS = [
  { id: 'gold', label: 'Dourado Nobre', color: '#D4AF37' },
  { id: 'brown', label: 'Marrom Café Acetinado', color: '#4A2C1B' },
  { id: 'red', label: 'Vermelho Carmim', color: '#A31D24' },
  { id: 'kraft', label: 'Fio de Rami Rústico', color: '#B39268' },
];

export const BoxBuilderModal: React.FC<BoxBuilderModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddBoxToCart,
  settings,
}) => {
  const [boxSize, setBoxSize] = useState<4 | 6 | 12>(6);
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});
  const [ribbon, setRibbon] = useState(RIBBON_OPTIONS[0].label);
  const [cardMessage, setCardMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic box price lookup from settings or defaults
  const getBoxPrice = (size: 4 | 6 | 12): number => {
    if (size === 4 && typeof settings?.box4Price === 'number' && !isNaN(settings.box4Price)) {
      return settings.box4Price;
    }
    if (size === 6 && typeof settings?.box6Price === 'number' && !isNaN(settings.box6Price)) {
      return settings.box6Price;
    }
    if (size === 12 && typeof settings?.box12Price === 'number' && !isNaN(settings.box12Price)) {
      return settings.box12Price;
    }
    return DEFAULT_BOX_DATA[size].defaultPrice;
  };

  // Available single alfajores (filter out kits)
  const singleProducts = useMemo(() => {
    return products.filter(
      (p) => p.category !== 'Kits & Presentes' && p.category !== 'Caixas & Kits' && p.available
    );
  }, [products]);

  const totalSelected = useMemo(() => {
    return Object.entries(selectedCounts).reduce(
      (sum, [, qty]) => sum + Number(qty),
      0
    );
  }, [selectedCounts]);

  const remaining = boxSize - totalSelected;

  if (!isOpen) return null;

  const handleIncrement = (productId: string) => {
    if (totalSelected >= boxSize) return;
    setSelectedCounts((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleDecrement = (productId: string) => {
    setSelectedCounts((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const handleSizeChange = (newSize: 4 | 6 | 12) => {
    setBoxSize(newSize);
    setSelectedCounts({});
  };

  const handleAddCustomBox = () => {
    if (totalSelected !== boxSize) return;

    const items = Object.entries(selectedCounts).map(([productId, quantity]) => {
      const prod = products.find((p) => p.id === productId);
      return {
        productId,
        productName: prod ? prod.name : 'Alfajor',
        quantity: Number(quantity),
      };
    });

    const currentPrice = getBoxPrice(boxSize);
    const boxData: CustomBoxItem = {
      id: 'box-' + Date.now(),
      title: DEFAULT_BOX_DATA[boxSize].name,
      boxSize,
      items,
      ribbonColor: ribbon,
      giftCardMessage: cardMessage.trim() || undefined,
      price: currentPrice,
      imageUrl: DEFAULT_BOX_DATA[boxSize].image,
    };

    onAddBoxToCart(boxData);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setSelectedCounts({});
      setCardMessage('');
    }, 800);
  };

  return (
    <div
      id="box-builder-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="box-builder-content"
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#E8DEC7] my-6 relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#EBE3D3] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2C799] text-[#2B1810] flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-brand text-lg sm:text-xl font-bold text-[#2B1810]">
                {settings?.boxModalTitle || 'Monte Sua Caixa de Alfajores'}
              </h3>
              <p className="text-xs text-[#7A6453]">
                {settings?.boxModalSubtitle || 'Escolha o tamanho e selecione seus sabores favoritos'}
              </p>
            </div>
          </div>

          <button
            id="close-box-builder-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8C735F] hover:text-[#2B1810] rounded-full hover:bg-[#F0E8DC] transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-grow">
          {/* Box Size Selector */}
          <div>
            <label className="block text-xs font-bold text-[#4D382A] uppercase tracking-wider mb-2">
              {settings?.boxModalStep1Label || '1. Escolha o Tamanho da Caixa'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([4, 6, 12] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    boxSize === size
                      ? 'bg-[#3B2011] text-[#FAF7F2] border-[#3B2011] shadow-xs'
                      : 'bg-[#FAF7F2] text-[#4A3425] border-[#DECDB7] hover:bg-[#F5ECE0]'
                  }`}
                >
                  <span className="block text-base font-extrabold">{size} unidades</span>
                  <span className="block text-xs mt-0.5 opacity-90 font-medium">
                    {formatCurrencyBRL(getBoxPrice(size))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE1CF]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-[#3B2011]">
                Sabores selecionados: {totalSelected} de {boxSize}
              </span>
              <span className={remaining === 0 ? 'text-emerald-700' : 'text-[#8C5D38]'}>
                {remaining === 0 ? '✓ Caixa completa!' : `Faltam ${remaining} alfajores`}
              </span>
            </div>
            <div className="w-full bg-[#E5DAC6] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#3B2011] h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalSelected / boxSize) * 100)}%` }}
              />
            </div>
          </div>

          {/* Flavor Selection List */}
          <div>
            <label className="block text-xs font-bold text-[#4D382A] uppercase tracking-wider mb-2">
              {settings?.boxModalStep2Label || '2. Escolha os Sabores da Sua Caixa'}
            </label>
            <div className="space-y-2">
              {singleProducts.map((prod) => {
                const count = selectedCounts[prod.id] || 0;
                return (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl border border-[#EDE4D2] bg-white hover:border-[#D6C7B2] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E2D6C0]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#2B1810] truncate">{prod.name}</p>
                        <p className="text-[11px] text-[#7A6453] line-clamp-1">{prod.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 bg-[#FAF7F2] p-1 rounded-xl border border-[#DECDB7]">
                      <button
                        type="button"
                        disabled={count <= 0}
                        onClick={() => handleDecrement(prod.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3B2011] hover:bg-white disabled:opacity-30 transition cursor-pointer"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-extrabold text-[#2B1810]">
                        {count}
                      </span>
                      <button
                        type="button"
                        disabled={totalSelected >= boxSize}
                        onClick={() => handleIncrement(prod.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3B2011] hover:bg-white disabled:opacity-30 transition cursor-pointer"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ribbon Selection */}
          <div>
            <label className="block text-xs font-bold text-[#4D382A] uppercase tracking-wider mb-2">
              {settings?.boxModalStep3Label || '3. Cor do Laço de Fita'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {RIBBON_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRibbon(opt.label)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    ribbon === opt.label
                      ? 'border-[#3B2011] bg-[#F7F2EA] font-bold text-[#2B1810]'
                      : 'border-[#E2D6C0] bg-white text-[#5C4535] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span className="text-[11px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Observation */}
          <div>
            <label className="block text-xs font-bold text-[#4D382A] uppercase tracking-wider mb-1">
              {settings?.boxModalStep4Label || '4. Observações para a Caixa'}
            </label>
            <textarea
              rows={2}
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              placeholder="Alguma preferência ou observação especial para o preparo dos seus alfajores..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#EBE3D3] bg-[#FAF7F2] flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-xs text-[#7A6453] block">Valor da Caixa:</span>
            <span className="font-sans text-lg font-extrabold text-[#3B2011]">
              {formatCurrencyBRL(getBoxPrice(boxSize))}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-[#665040] hover:text-[#2B1810] rounded-xl transition"
            >
              Cancelar
            </button>

            <button
              id="submit-box-builder-btn"
              type="button"
              disabled={totalSelected !== boxSize}
              onClick={handleAddCustomBox}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                totalSelected !== boxSize
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2]'
              }`}
            >
              {isSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Caixa Adicionada!</span>
                </>
              ) : (
                <>
                  <Package className="w-3.5 h-3.5 text-[#E2C799]" />
                  <span>
                    {remaining > 0
                      ? `Selecione mais ${remaining}`
                      : 'Adicionar Caixa ao Carrinho'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
