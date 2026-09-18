import React from 'react';
import { Clock, Phone, MessageCircle, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { LogoAndrey } from './LogoAndrey';
import { StoreSettings } from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/storeSettings';

interface FooterProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  settings?: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  isAdminLoggedIn,
  settings = INITIAL_STORE_SETTINGS,
}) => {
  const currentSettings = settings || INITIAL_STORE_SETTINGS;
  return (
    <footer className="w-full bg-[#241710] text-[#D9CAB7] pt-10 pb-12 px-4 mt-12 border-t border-[#3B281D]">
      <div className="max-w-md mx-auto flex flex-col items-center text-center space-y-6">
        {/* Brand presentation */}
        <div>
          <div className="mx-auto mb-3 flex justify-center">
            <LogoAndrey className="w-16 h-16 rounded-2xl shadow-md border border-[#5C3F2D]" />
          </div>
          <h3 className="font-serif-brand text-xl font-bold text-[#F4EFE6] tracking-wide">
            Alfajoraria Andrey
          </h3>
          <p className="text-xs uppercase tracking-[0.2em] text-[#C9A982] font-semibold mt-0.5">
            Alfajores Artesanais • Onde nasce o sabor!
          </p>
          <p className="text-xs text-[#A8927F] mt-1.5 max-w-xs leading-relaxed">
            Alfajores artesanais produzidos com ingredientes nobres, dedicação em cada camada e muito carinho.
          </p>
        </div>

        {/* Business Hours & Contact Details */}
        <div className="w-full max-w-xs bg-[#2D1B13] border border-[#452D1F] rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-center gap-2 text-[#E5D7C5]">
            <Clock className="w-4 h-4 text-[#D4AF77] shrink-0" />
            <span>
              <strong className="font-semibold text-[#FAF7F2]">Horário:</strong> {currentSettings.openingHours}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-[#C5AA94]">
            <MapPin className="w-4 h-4 text-[#D4AF77] shrink-0" />
            <span>{currentSettings.address}</span>
          </div>

          <div className="h-px bg-[#3F2B20] w-3/4 mx-auto" />

          <div className="flex items-center justify-center gap-2.5">
            <a
              id="footer-whatsapp-link"
              href={`https://wa.me/${currentSettings.whatsapp}?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20uma%20encomenda%20de%20alfajores`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#4ADE80] border border-[#25D366]/40 rounded-full font-medium transition cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              id="footer-phone-link"
              href={`tel:${currentSettings.phone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3B261A] hover:bg-[#4A3022] text-[#E2C799] border border-[#543825] rounded-full font-medium transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4AF77]" />
              <span>Ligar</span>
            </a>
          </div>
        </div>

        {/* Discrete Administration Button */}
        <div className="pt-1">
          <button
            id="footer-admin-button"
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-2 text-xs text-[#9E8B7A] hover:text-[#E2C799] py-2 px-3.5 rounded-xl border border-[#3D291F] hover:border-[#634533] bg-[#2E1D14]/60 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#A6886A]" />
            <span>Área Administrativa</span>
            {isAdminLoggedIn && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sessão de Dono Ativa"></span>
            )}
          </button>
        </div>

        <p className="text-[11px] text-[#695446] pt-1">
          © {new Date().getFullYear()} Alfajoraria Andrey • Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};
