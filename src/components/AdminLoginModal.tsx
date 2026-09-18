import React, { useState } from 'react';
import { signInAdmin, DEFAULT_ADMIN_EMAIL } from '../services/authService';
import { LogoAndrey } from './LogoAndrey';
import { X, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Por favor, informe seu e-mail.');
      return;
    }

    if (!password) {
      setErrorMsg('Por favor, digite sua senha de acesso.');
      return;
    }

    try {
      setLoading(true);
      await signInAdmin(email, password);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na autenticação. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-login-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="admin-login-modal-content"
        className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[#E8DEC7] p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-admin-login-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#8C735F] hover:text-[#2B1810] rounded-full hover:bg-[#F5EFE6] transition cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="mx-auto mb-2 flex justify-center">
            <LogoAndrey className="w-16 h-16 rounded-2xl shadow-md border border-[#D4B58B]" />
          </div>
          <h2 className="font-serif-brand text-xl font-bold text-[#2B1810]">
            Painel do Proprietário
          </h2>
          <p className="text-xs text-[#735A47] mt-0.5">
            Autenticação Segura • Firebase Auth
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#C8E6C9]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">Acesso Restrito ao Firestore</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#543F30] mb-1">
              E-mail do Administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9E8B7A] absolute left-3 top-3" />
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email@exemplo.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#784627] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#543F30] mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9E8B7A] absolute left-3 top-3" />
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full pl-9 pr-10 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-sm text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#784627] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#9E8B7A] hover:text-[#2B1810] p-0.5 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
