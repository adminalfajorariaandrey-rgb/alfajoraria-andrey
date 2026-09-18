import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Qual é a validade e como conservar os alfajores?',
      a: 'Nossos alfajores artesanais têm validade de 25 a 30 dias a partir da data de fabricação. Devem ser conservados em local fresco, arejado e ao abrigo do sol. Em dias muito quentes, você pode mantê-los na geladeira e retirar 10 minutos antes de consumir para uma textura perfeita.',
    },
    {
      q: 'Como funciona o pedido e entrega pelo WhatsApp?',
      a: 'Basta selecionar seus sabores ou montar sua caixa aqui no site e clicar em "Enviar Pedido para o WhatsApp". Uma mensagem pronta e detalhada será enviada diretamente para a nossa equipe. Confirmamos o horário de entrega ou retirada e enviamos a chave Pix ou detalhes da entrega.',
    },
    {
      q: 'Vocês fazem encomendas para festas, casamentos e empresas?',
      a: 'Sim! Produzimos caixas comemorativas personalizadas, mini alfajores para lembrancinhas e kits corporativos com laço e tag personalizada. Recomendamos solicitar com no mínimo 3 a 5 dias de antecedência pelo nosso WhatsApp.',
    },
    {
      q: 'Quais são as formas de pagamento aceitas?',
      a: 'Aceitamos Pix com confirmação instantânea, Cartões de Crédito e Débito (no ato da entrega ou retirada) e Dinheiro.',
    },
  ];

  return (
    <section className="my-8 bg-white rounded-3xl p-5 sm:p-7 border border-[#EDE4D2] shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[#E2C799]/40 text-[#543824] flex items-center justify-center">
          <HelpCircle className="w-4 h-4" />
        </div>
        <h3 className="font-serif-brand text-lg sm:text-xl font-bold text-[#2B1810]">
          Dúvidas Frequentes
        </h3>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className="border border-[#EFE5D3] rounded-2xl overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full text-left p-3.5 bg-[#FAF7F2] hover:bg-[#F5EFE6] flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#2B1810] transition cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#8C5D38] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8C5D38] shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="p-3.5 bg-white text-xs text-[#5C4535] leading-relaxed border-t border-[#EFE5D3]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
