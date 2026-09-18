import React, { useState, useMemo } from 'react';
import {
  CartItem,
  CustomBoxItem,
  OrderDeliveryMethod,
  OrderPaymentMethod,
  StoreSettings,
  Product,
} from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/storeSettings';
import { formatCurrencyBRL } from '../utils/formatters';
import { normalizeCartItem, normalizeCustomBox } from '../utils/cartUtils';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  CreditCard,
  Banknote,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  Package,
} from 'lucide-react';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Compatibilidade com ambos os nomes de props
  items?: CartItem[];
  cartItems?: CartItem[];
  boxes?: CustomBoxItem[];
  customBoxes?: CustomBoxItem[];
  onUpdateQuantity?: (productId: string, delta: number) => void;
  onUpdateCartItemQty?: (productId: string, delta: number) => void;
  onRemoveItem?: (productId: string) => void;
  onRemoveCartItem?: (productId: string) => void;
  onRemoveBox?: (boxId: string) => void;
  onRemoveCustomBox?: (boxId: string) => void;
  onClearCart: () => void;
  settings?: StoreSettings;
  availableProducts?: Product[];
}

export const CartDrawer: React.FC<CartDrawerProps> = (props) => {
  const { isOpen, onClose, onClearCart, settings, availableProducts } = props;

  const currentSettings = settings || INITIAL_STORE_SETTINGS;

  // Normalização flexível das props recebidas
  const rawItems = props.items ?? props.cartItems ?? [];
  const rawBoxes = props.boxes ?? props.customBoxes ?? [];
  const handleUpdateQty =
    props.onUpdateQuantity ?? props.onUpdateCartItemQty ?? (() => {});
  const handleRemoveItem =
    props.onRemoveItem ?? props.onRemoveCartItem ?? (() => {});
  const handleRemoveBox =
    props.onRemoveBox ?? props.onRemoveCustomBox ?? (() => {});

  // Higienização completa dos itens e caixas com dados seguros
  const safeItems: CartItem[] = useMemo(() => {
    return (Array.isArray(rawItems) ? rawItems : [])
      .map((item) => normalizeCartItem(item, availableProducts))
      .filter((item): item is CartItem => item !== null);
  }, [rawItems, availableProducts]);

  const safeBoxes: CustomBoxItem[] = useMemo(() => {
    return (Array.isArray(rawBoxes) ? rawBoxes : [])
      .map((box) => normalizeCustomBox(box, availableProducts))
      .filter((box): box is CustomBoxItem => box !== null);
  }, [rawBoxes, availableProducts]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<OrderDeliveryMethod>('pickup');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('pix');
  const [orderNotes, setOrderNotes] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const itemsSubtotal = safeItems.reduce((sum, item) => {
    const price = Number(item?.product?.price) || 0;
    const qty = Number(item?.quantity) || 1;
    return sum + price * qty;
  }, 0);

  const boxesSubtotal = safeBoxes.reduce(
    (sum, box) => sum + (Number(box?.price) || 0),
    0
  );

  const orderTotal = itemsSubtotal + boxesSubtotal;

  const totalItemsCount =
    safeItems.reduce((acc, it) => acc + (Number(it?.quantity) || 1), 0) +
    safeBoxes.length;

  const generateWhatsAppMessage = () => {
    let msg = `🍰 *NOVO PEDIDO - ALFAJORARIA ANDREY* 🍰\n`;
    msg += `----------------------------------------\n`;
    msg += `👤 *Cliente:* ${customerName.trim() || 'Não informado'}\n`;
    msg += `📱 *Telefone/WhatsApp:* ${customerPhone.trim() || 'Não informado'}\n`;
    msg += `📍 *Modalidade:* ${
      deliveryMethod === 'pickup'
        ? 'Retirada no Ateliê (Sem taxa)'
        : `Entrega (Delivery) em ${address.trim()}${
            neighborhood ? `, Bairro: ${neighborhood.trim()}` : ''
          }${complement ? ` (${complement.trim()})` : ''}`
    }\n`;

    const paymentLabels: Record<OrderPaymentMethod, string> = {
      pix: 'Pix (Chave informada no atendimento)',
      card: 'Cartão de Débito / Crédito',
      cash: 'Dinheiro',
    };
    msg += `💳 *Forma de Pagamento:* ${paymentLabels[paymentMethod] || 'Pix'}\n`;
    msg += `----------------------------------------\n`;
    msg += `*ITENS DO PEDIDO:*\n`;

    safeItems.forEach((it) => {
      const price = Number(it?.product?.price) || 0;
      const qty = Number(it?.quantity) || 1;
      const name = it?.product?.name || 'Alfajor Artesanal';
      const lineTotal = formatCurrencyBRL(price * qty);
      msg += `• ${qty}x ${name} (${formatCurrencyBRL(price)} un) = ${lineTotal}\n`;
    });

    safeBoxes.forEach((box) => {
      const bTitle = box?.title || 'Caixa de Alfajores';
      const bPrice = Number(box?.price) || 0;
      const bRibbon = box?.ribbonColor || 'Dourado';
      const bItems = Array.isArray(box?.items) ? box.items : [];
      msg += `\n📦 *${bTitle}* - ${formatCurrencyBRL(bPrice)}\n`;
      msg += `   Fita: ${bRibbon}\n`;
      msg += `   Sabores Escolhidos:\n`;
      bItems.forEach((flavor) => {
        msg += `   • ${flavor.quantity}x ${flavor.productName}\n`;
      });
      if (box?.giftCardMessage) {
        msg += `   Observações: "${box.giftCardMessage}"\n`;
      }
    });

    msg += `----------------------------------------\n`;
    if (orderNotes.trim()) {
      msg += `📝 *Observações do Pedido:* ${orderNotes.trim()}\n`;
    }
    msg += `💰 *VALOR TOTAL:* ${formatCurrencyBRL(orderTotal)}\n`;
    msg += `----------------------------------------\n`;
    msg += `Por favor, confirmem a disponibilidade para preparar o meu pedido!`;

    return msg;
  };

  const handleSendOrder = () => {
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu Nome para identificação do pedido.');
      return;
    }
    if (!customerPhone.trim()) {
      setValidationError('Por favor, informe seu número de Telefone / WhatsApp.');
      return;
    }
    if (deliveryMethod === 'delivery' && (!address.trim() || !neighborhood.trim())) {
      setValidationError('Por favor, informe o Endereço e o Bairro para entrega.');
      return;
    }

    const message = generateWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${currentSettings.whatsapp}?text=${encoded}`, '_blank');
  };

  const handleCopySummary = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="cart-drawer-content"
        className="bg-[#FAF7F2] w-full max-w-md h-full flex flex-col shadow-2xl border-l border-[#E2D6C0] animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#2B1810] text-[#FAF7F2] flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#E2C799]" />
            <div>
              <h3 className="font-serif-brand font-bold text-lg text-[#FAF7F2]">
                Seu Pedido
              </h3>
              <p className="text-[11px] text-[#C5AA94]">
                {totalItemsCount} {totalItemsCount === 1 ? 'item no pedido' : 'itens no pedido'}
              </p>
            </div>
          </div>

          <button
            id="close-cart-drawer-btn"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 text-[#C5AA94] hover:text-[#FAF7F2] rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Items & Form Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-grow">
          {totalItemsCount === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-[#C4B29E] mx-auto opacity-50" />
              <h4 className="font-serif-brand text-base font-bold text-[#2B1810]">
                Seu carrinho está vazio
              </h4>
              <p className="text-xs text-[#7A6453] max-w-xs mx-auto">
                Adicione sabores artesanais ou monte sua caixa personalizada para enviar seu pedido pelo WhatsApp.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 text-xs font-bold text-[#3B2011] bg-white border border-[#DECDB7] px-4 py-2 rounded-xl hover:bg-[#F3EBE0] transition cursor-pointer"
              >
                Explorar Cardápio
              </button>
            </div>
          ) : (
            <>
              {/* Product Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#4A3425] border-b border-[#E8DEC7] pb-1.5">
                  <span>Itens Selecionados</span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[11px] text-red-700 hover:underline font-semibold cursor-pointer"
                  >
                    Esvaziar
                  </button>
                </div>

                {safeItems.map((item, idx) => {
                  const prod = item?.product || ({} as Partial<Product>);
                  const price = Number(prod.price) || 0;
                  const qty = Number(item?.quantity) || 1;
                  const prodId = String(prod.id || `item-${idx}`);
                  const prodName = String(prod.name || 'Alfajor Artesanal');
                  const prodImg = prod.imageUrl || '/logo_andrey.svg';

                  return (
                    <div
                      key={prodId}
                      className="p-3 bg-white rounded-2xl border border-[#EBE3D3] shadow-2xs flex items-center justify-between gap-3"
                    >
                      <img
                        src={prodImg}
                        alt={prodName}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logo_andrey.svg';
                        }}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E2D6C0]"
                        referrerPolicy="no-referrer"
                      />

                      <div className="min-w-0 flex-grow">
                        <p className="text-xs font-bold text-[#2B1810] truncate">
                          {prodName}
                        </p>
                        <p className="text-[11px] text-[#8C735F]">
                          {formatCurrencyBRL(price)} cada
                        </p>
                        <p className="text-xs font-extrabold text-[#3B2011]">
                          {formatCurrencyBRL(price * qty)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 bg-[#FAF7F2] p-1 rounded-xl border border-[#DECDB7]">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(prodId, -1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#3B2011] hover:bg-white transition cursor-pointer"
                          aria-label="Diminuir"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[#2B1810]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(prodId, 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#3B2011] hover:bg-white transition cursor-pointer"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(prodId)}
                        className="p-1.5 text-[#B3927D] hover:text-red-600 transition cursor-pointer"
                        aria-label="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {/* Custom Gift Boxes */}
                {safeBoxes.map((box, bIdx) => {
                  const boxId = String(box?.id || `box-${bIdx}`);
                  const boxTitle = String(box?.title || 'Caixa de Alfajores');
                  const boxRibbon = String(box?.ribbonColor || 'Dourado');
                  const boxPrice = Number(box?.price) || 0;
                  const boxItems = Array.isArray(box?.items) ? box.items : [];

                  return (
                    <div
                      key={boxId}
                      className="p-3.5 bg-[#FFF9EE] rounded-2xl border border-[#E5D2A8] shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#8C5D38] shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-[#2B1810]">{boxTitle}</p>
                            <p className="text-[11px] text-[#7A6453]">
                              Fita: {boxRibbon}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[#3B2011] block">
                            {formatCurrencyBRL(boxPrice)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBox(boxId)}
                            className="text-[11px] text-red-600 hover:underline inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remover</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/80 p-2 rounded-xl text-[11px] text-[#4A382A] space-y-0.5">
                        <p className="font-bold text-[10px] uppercase text-[#8C735F]">
                          Sabores selecionados:
                        </p>
                        {boxItems.map((it, idx) => (
                          <p key={idx}>
                            • {Number(it?.quantity) || 1}x {it?.productName || 'Alfajor'}
                          </p>
                        ))}
                        {box?.giftCardMessage && (
                          <p className="italic text-[10px] text-[#8C5D38] pt-1 border-t border-[#EFE5CE]">
                            Mensagem: "{box.giftCardMessage}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Validation Alert */}
              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Customer & Delivery Form */}
              <div className="bg-white p-4 rounded-2xl border border-[#EDE4D2] space-y-3 text-xs">
                <h4 className="font-bold text-[#3B2011] uppercase tracking-wider text-[11px] border-b border-[#F0E6D5] pb-1.5">
                  Dados do Cliente & Entrega
                </h4>

                <div>
                  <label className="block font-semibold text-[#543F30] mb-1">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ex: Maria Silva"
                    className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#543F30] mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(24) 99999-9999"
                    className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                  />
                </div>

                {/* Delivery Method Choice */}
                <div>
                  <label className="block font-semibold text-[#543F30] mb-1.5">
                    Como deseja receber? *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        deliveryMethod === 'pickup'
                          ? 'bg-[#3B2011] text-white border-[#3B2011] font-bold'
                          : 'bg-[#FAF7F2] text-[#4A3425] border-[#DECDB7]'
                      }`}
                    >
                      <span className="block text-xs">Retirada no Ateliê</span>
                      <span className="block text-[10px] opacity-85">Sem taxa de entrega</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        deliveryMethod === 'delivery'
                          ? 'bg-[#3B2011] text-white border-[#3B2011] font-bold'
                          : 'bg-[#FAF7F2] text-[#4A3425] border-[#DECDB7]'
                      }`}
                    >
                      <span className="block text-xs">Entrega (Delivery)</span>
                      <span className="block text-[10px] opacity-85">Taxa sob consulta</span>
                    </button>
                  </div>
                </div>

                {/* Address inputs if delivery */}
                {deliveryMethod === 'delivery' && (
                  <div className="space-y-2 pt-1 border-t border-[#F2ECE1]">
                    <div>
                      <label className="block font-semibold text-[#543F30] mb-1">
                        Endereço Completo (Rua e Número) *
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Rua das Flores, 123"
                        className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-[#543F30] mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          placeholder="Centro"
                          className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#543F30] mb-1">
                          Complemento / Apto
                        </label>
                        <input
                          type="text"
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          placeholder="Apto 201"
                          className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method Selection */}
                <div>
                  <label className="block font-semibold text-[#543F30] mb-1.5">
                    Forma de Pagamento Preferida
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                        paymentMethod === 'pix'
                          ? 'border-[#3B2011] bg-[#F7F2EA] font-bold text-[#2B1810]'
                          : 'border-[#E2D6C0] bg-[#FAF7F2] text-[#5C4535]'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px]">Pix</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-[#3B2011] bg-[#F7F2EA] font-bold text-[#2B1810]'
                          : 'border-[#E2D6C0] bg-[#FAF7F2] text-[#5C4535]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#8C5D38]" />
                      <span className="text-[11px]">Cartão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'border-[#3B2011] bg-[#F7F2EA] font-bold text-[#2B1810]'
                          : 'border-[#E2D6C0] bg-[#FAF7F2] text-[#5C4535]'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-[#8C5D38]" />
                      <span className="text-[11px]">Dinheiro</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-[#543F30] mb-1">
                    Observações do Pedido / Troco
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Instruções de entrega, necessidade de troco para dinheiro, etc."
                    className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with Totals & WhatsApp CTA */}
        {totalItemsCount > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFC8] space-y-3 shrink-0 shadow-lg">
            {/* Price Calculations */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#735A47]">
                <span>Subtotal dos alfajores:</span>
                <span>{formatCurrencyBRL(itemsSubtotal + boxesSubtotal)}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between text-[11px] text-[#8C5D38] italic">
                  <span>Taxa de entrega:</span>
                  <span>Calculada no WhatsApp</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#2B1810] pt-1.5 border-t border-[#EFE8DA]">
                <span>Total do Pedido:</span>
                <span className="font-sans text-lg text-[#3B2011]">
                  {formatCurrencyBRL(orderTotal)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                id="send-whatsapp-order-btn"
                type="button"
                onClick={handleSendOrder}
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar Pedido para o WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full py-2 px-3 text-xs font-semibold text-[#665040] hover:text-[#2B1810] bg-[#FAF7F2] hover:bg-[#F3ECE0] rounded-xl border border-[#DECDB7] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-emerald-700 font-bold">Resumo Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Resumo do Pedido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
