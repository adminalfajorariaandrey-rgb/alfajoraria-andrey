import React, { useState, useEffect } from 'react';
import { Product, ProductFormData, AuthUser, StoreSettings } from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/storeSettings';
import { formatCurrencyBRL } from '../utils/formatters';
import { ProductFormModal } from './ProductFormModal';
import { LogoAndrey } from './LogoAndrey';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  LogOut,
  Package,
  CheckCircle2,
  XCircle,
  Search,
  Settings,
  MessageCircle,
  Phone,
  Clock,
  MapPin,
  Save,
  Check,
  ShieldCheck,
  Sparkles,
  Loader2,
  Type,
  Layout,
  FileText,
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  currentUser: AuthUser | null;
  settings: StoreSettings;
  onLogout: () => void;
  onViewMenu: () => void;
  onAddProduct: (data: ProductFormData, file: File | null) => Promise<void>;
  onUpdateProduct: (id: string, data: ProductFormData, file: File | null) => Promise<void>;
  onDeleteProduct: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onSaveSettings: (settings: StoreSettings) => Promise<void> | void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  currentUser,
  settings,
  onLogout,
  onViewMenu,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleAvailability,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'boxes' | 'settings'>('products');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchAdminQuery, setSearchAdminQuery] = useState('');
  const [adminCategory, setAdminCategory] = useState('Todos');

  // Store Settings State
  const [formSettings, setFormSettings] = useState<StoreSettings>(
    settings || INITIAL_STORE_SETTINGS
  );
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormSettings(settings);
    }
  }, [settings]);

  const availableCount = products.filter((p) => p.available).length;
  const outOfStockCount = products.length - availableCount;

  const filteredProducts = products.filter((p) => {
    const matchesCat = adminCategory === 'Todos' || p.category === adminCategory;
    const q = searchAdminQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.ingredients.some((ing) => ing.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleOpenNew = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setProductToEdit(p);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    onDeleteProduct(productToDelete.id);
    setProductToDelete(null);
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsError(null);
    try {
      await onSaveSettings(formSettings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar configurações no Firestore:', err);
      setSettingsError(
        'Ocorreu um erro ao salvar as configurações no Firestore. Por favor, tente novamente.'
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D241E] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#2B1810] text-[#F5EFE6] border-b border-[#4A2D1F] sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoAndrey className="w-9 h-9 rounded-xl shrink-0 border border-[#E2C799]/60 shadow-xs" />
            <div>
              <h1 className="font-serif-brand font-bold text-base sm:text-lg leading-tight text-[#FAF7F2]">
                Alfajoraria Andrey
              </h1>
              <p className="text-[11px] text-[#C2AA94]">
                Painel do Administrador • {currentUser?.email || 'Proprietário'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="admin-view-menu-btn"
              type="button"
              onClick={onViewMenu}
              className="px-3.5 py-1.5 bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 text-[#FAF7F2] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#E2C799]" />
              <span className="hidden sm:inline">Ver Cardápio</span>
              <span className="sm:hidden">Cardápio</span>
            </button>

            <button
              id="admin-logout-btn"
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-red-800/40 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-grow">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#E2D6C0] pb-2">
          <button
            id="admin-tab-products-btn"
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#3B2011] text-white shadow-xs'
                : 'text-[#665040] hover:bg-[#F0E6D5]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produtos & Cardápio ({products.length})</span>
          </button>

          <button
            id="admin-tab-boxes-btn"
            type="button"
            onClick={() => setActiveTab('boxes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'boxes'
                ? 'bg-[#3B2011] text-white shadow-xs'
                : 'text-[#665040] hover:bg-[#F0E6D5]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#E2C799]" />
            <span>Caixas Personalizadas & Textos</span>
          </button>

          <button
            id="admin-tab-settings-btn"
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#3B2011] text-white shadow-xs'
                : 'text-[#665040] hover:bg-[#F0E6D5]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações da Loja</span>
          </button>
        </div>

        {activeTab === 'products' && (
          <>
            {/* Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white p-3.5 rounded-2xl border border-[#EDE4D2] shadow-2xs">
                <p className="text-[11px] font-bold text-[#8C735F] uppercase tracking-wider">
                  Total Cadastrado
                </p>
                <p className="font-serif-brand text-xl sm:text-2xl font-bold text-[#2B1810]">
                  {products.length}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#EDE4D2] shadow-2xs">
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Disponíveis
                </p>
                <p className="font-serif-brand text-xl sm:text-2xl font-bold text-emerald-800">
                  {availableCount}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#EDE4D2] shadow-2xs">
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                  Esgotados
                </p>
                <p className="font-serif-brand text-xl sm:text-2xl font-bold text-red-800">
                  {outOfStockCount}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              {/* Search in admin */}
              <div className="relative flex-grow max-w-sm">
                <Search className="w-4 h-4 text-[#8C735F] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchAdminQuery}
                  onChange={(e) => setSearchAdminQuery(e.target.value)}
                  placeholder="Filtrar por nome ou ingrediente..."
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-[#784627]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="admin-add-product-btn"
                  type="button"
                  onClick={handleOpenNew}
                  className="px-4 py-2.5 bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2] text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#E2C799]" />
                  <span>Adicionar Novo Alfajor</span>
                </button>
              </div>
            </div>

            {/* Product Rows */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E8DFC8] my-8">
                <Package className="w-12 h-12 text-[#B39D88] mx-auto mb-3 opacity-60" />
                <h3 className="font-serif-brand text-lg font-bold text-[#2B1810]">
                  Nenhum alfajor encontrado
                </h3>
                <p className="text-xs text-[#735A47] max-w-sm mx-auto mt-1 mb-4">
                  Cadastre seus produtos artesanais para exibi-los no cardápio aos clientes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenNew}
                    className="px-4 py-2 bg-[#3B2011] text-[#FAF7F2] text-xs font-bold rounded-xl shadow transition cursor-pointer"
                  >
                    Cadastrar Novo Alfajor
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    id={`admin-product-row-${item.id}`}
                    className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EBE3D3] shadow-xs hover:shadow transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    {/* Item Details */}
                    <div className="flex items-center gap-3.5 flex-grow min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-[#FAF7F2] overflow-hidden shrink-0 border border-[#E2D6C0]">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-[#2B1810] truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-semibold bg-[#F5EFE6] text-[#6B503D] px-2 py-0.5 rounded-full border border-[#E2D6C0]">
                            {item.category}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-bold bg-[#E2C799] text-[#2B1810] px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#735A47] line-clamp-1 mt-0.5">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="font-extrabold text-[#3B2011]">
                            {formatCurrencyBRL(item.price)}
                          </span>
                          <span className="text-[11px] text-[#8C735F]">
                            {item.ingredients.length} ingredientes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stock Switch & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5EFE6]">
                      {/* Availability Switch */}
                      <button
                        type="button"
                        onClick={() => onToggleAvailability(item.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                        }`}
                        title="Clique para alternar disponibilidade"
                      >
                        {item.available ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Disponível</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Esgotado</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 bg-[#F5EFE6] hover:bg-[#EBDDC9] text-[#4A3425] text-xs font-semibold rounded-xl flex items-center gap-1 transition border border-[#DECDB7] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProductToDelete(item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200 cursor-pointer"
                          aria-label="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Box Pricing & Customization Tab */}
        {activeTab === 'boxes' && (
          <div className="bg-white rounded-3xl p-6 border border-[#EDE4D2] shadow-xs max-w-3xl">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#E8DFC8]">
              <div className="w-10 h-10 rounded-2xl bg-[#E2C799] text-[#2B1810] flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-[#2B1810]">
                  Caixas Personalizadas & Textos
                </h3>
                <p className="text-xs text-[#7A6453]">
                  Ajuste os preços das caixas e personalize todos os textos do banner e do modal exibidos aos clientes
                </p>
              </div>
            </div>

            {settingsSaved && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 shadow-2xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Configurações e textos salvos com sucesso no Firestore! As alterações já estão sincronizadas em tempo real para todos os clientes.</span>
              </div>
            )}

            {settingsError && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2.5 shadow-2xs">
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStoreSettings} className="space-y-6">
              {/* SEÇÃO 1: Valores das Caixas */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-[#F0E6D5]">
                  <Package className="w-4 h-4 text-[#8C5D38]" />
                  <h4 className="font-bold text-xs text-[#4D382A] uppercase tracking-wider">
                    1. Valores das Caixas Personalizadas
                  </h4>
                </div>

                {/* Caixa 4 Unidades */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE1CF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80"
                      alt="Caixa 4 alfajores"
                      className="w-14 h-14 rounded-xl object-cover border border-[#DECDB7] shadow-2xs shrink-0"
                    />
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-[#E2C799] text-[#2B1810] rounded-full text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        4 Alfajores
                      </span>
                      <h5 className="font-bold text-sm text-[#2B1810]">Caixa de Alfajores (4 Unidades)</h5>
                      <p className="text-[11px] text-[#7A6453]">Caixa rígida artesanal com 4 sabores à escolha do cliente</p>
                      <p className="text-xs font-bold text-[#3B2011] mt-0.5">
                        Valor atual: {formatCurrencyBRL(formSettings.box4Price ?? 62)}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <label htmlFor="admin-box4-price" className="block text-[11px] font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                      Preço de Venda (R$)
                    </label>
                    <div className="relative w-36">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-[#8C735F]">R$</span>
                      <input
                        id="admin-box4-price"
                        type="number"
                        step="0.10"
                        min="1"
                        required
                        value={formSettings.box4Price ?? 62}
                        onChange={(e) =>
                          setFormSettings({
                            ...formSettings,
                            box4Price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-sm font-bold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                      />
                    </div>
                  </div>
                </div>

                {/* Caixa 6 Unidades */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE1CF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
                      alt="Caixa 6 alfajores"
                      className="w-14 h-14 rounded-xl object-cover border border-[#DECDB7] shadow-2xs shrink-0"
                    />
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-[#E2C799] text-[#2B1810] rounded-full text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        6 Alfajores
                      </span>
                      <h5 className="font-bold text-sm text-[#2B1810]">Caixa Seleção Especial (6 Unidades)</h5>
                      <p className="text-[11px] text-[#7A6453]">Caixa artesanal com 6 sabores à escolha do cliente</p>
                      <p className="text-xs font-bold text-[#3B2011] mt-0.5">
                        Valor atual: {formatCurrencyBRL(formSettings.box6Price ?? 89)}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <label htmlFor="admin-box6-price" className="block text-[11px] font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                      Preço de Venda (R$)
                    </label>
                    <div className="relative w-36">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-[#8C735F]">R$</span>
                      <input
                        id="admin-box6-price"
                        type="number"
                        step="0.10"
                        min="1"
                        required
                        value={formSettings.box6Price ?? 89}
                        onChange={(e) =>
                          setFormSettings({
                            ...formSettings,
                            box6Price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-sm font-bold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                      />
                    </div>
                  </div>
                </div>

                {/* Caixa 12 Unidades */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE1CF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80"
                      alt="Caixa 12 alfajores"
                      className="w-14 h-14 rounded-xl object-cover border border-[#DECDB7] shadow-2xs shrink-0"
                    />
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-[#E2C799] text-[#2B1810] rounded-full text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        12 Alfajores
                      </span>
                      <h5 className="font-bold text-sm text-[#2B1810]">Caixa Coleção Completa (12 Unidades)</h5>
                      <p className="text-[11px] text-[#7A6453]">Caixa com 12 alfajores sortidos e fita especial</p>
                      <p className="text-xs font-bold text-[#3B2011] mt-0.5">
                        Valor atual: {formatCurrencyBRL(formSettings.box12Price ?? 169)}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <label htmlFor="admin-box12-price" className="block text-[11px] font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                      Preço de Venda (R$)
                    </label>
                    <div className="relative w-36">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-[#8C735F]">R$</span>
                      <input
                        id="admin-box12-price"
                        type="number"
                        step="0.10"
                        min="1"
                        required
                        value={formSettings.box12Price ?? 169}
                        onChange={(e) =>
                          setFormSettings({
                            ...formSettings,
                            box12Price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-sm font-bold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: Textos do Banner na Página Inicial */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-[#F0E6D5]">
                  <Layout className="w-4 h-4 text-[#8C5D38]" />
                  <h4 className="font-bold text-xs text-[#4D382A] uppercase tracking-wider">
                    2. Banner "Monte Sua Caixa" na Página Inicial
                  </h4>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE1CF] space-y-3 text-xs">
                  <div>
                    <label htmlFor="admin-banner-badge" className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1 text-[11px]">
                      Selo / Destaque do Banner
                    </label>
                    <input
                      id="admin-banner-badge"
                      type="text"
                      value={formSettings.boxBannerBadge ?? 'Experiência Artesanal Exclusiva'}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, boxBannerBadge: e.target.value })
                      }
                      placeholder="Experiência Artesanal Exclusiva"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs font-semibold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-banner-title" className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1 text-[11px]">
                      Título Principal do Banner
                    </label>
                    <input
                      id="admin-banner-title"
                      type="text"
                      value={formSettings.boxBannerTitle ?? 'Monte Sua Caixa com Seus Sabores Favoritos'}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, boxBannerTitle: e.target.value })
                      }
                      placeholder="Monte Sua Caixa com Seus Sabores Favoritos"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs font-bold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-banner-desc" className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1 text-[11px]">
                      Descrição do Banner
                    </label>
                    <textarea
                      id="admin-banner-desc"
                      rows={2}
                      value={formSettings.boxBannerDescription ?? 'Massa artesanal macia que derrete na boca, recheio generoso e chocolate nobre. Selecione 4, 6 ou 12 unidades ao seu gosto!'}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, boxBannerDescription: e.target.value })
                      }
                      placeholder="Massa artesanal macia que derrete na boca, recheio generoso e chocolate nobre. Selecione 4, 6 ou 12 unidades ao seu gosto!"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-banner-btn" className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1 text-[11px]">
                      Texto do Botão do Banner
                    </label>
                    <input
                      id="admin-banner-btn"
                      type="text"
                      value={formSettings.boxBannerButtonText ?? 'Montar Caixa'}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, boxBannerButtonText: e.target.value })
                      }
                      placeholder="Montar Caixa"
                      className="w-full sm:w-60 px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs font-bold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: Textos do Modal "Monte Sua Caixa" */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-[#F0E6D5]">
                  <Type className="w-4 h-4 text-[#8C5D38]" />
                  <h4 className="font-bold text-xs text-[#4D382A] uppercase tracking-wider">
                    3. Textos do Modal "Monte Sua Caixa"
                  </h4>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE1CF] space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="admin-modal-title" className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1 text-[11px]">
                        Título do Modal
                      </label>
                      <input
                        id="admin-modal-title"
                        type="text"
                        value={formSettings.boxModalTitle ?? 'Monte Sua Caixa de Alfajores'}
                        onChange={(e) =>
                          setFormSettings({ ...formSettings, boxModalTitle: e.target.value })
                        }
                        placeholder="Monte Sua Caixa de Alfajores"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs font-bold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                      />
                    </div>

                    <div>
                      <label htmlFor="admin-modal-subtitle" className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1 text-[11px]">
                        Subtítulo do Modal
                      </label>
                      <input
                        id="admin-modal-subtitle"
                        type="text"
                        value={formSettings.boxModalSubtitle ?? 'Escolha o tamanho e selecione seus sabores favoritos'}
                        onChange={(e) =>
                          setFormSettings({ ...formSettings, boxModalSubtitle: e.target.value })
                        }
                        placeholder="Escolha o tamanho e selecione seus sabores favoritos"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#DECDB7]/60">
                    <p className="text-[11px] font-bold text-[#6D5341] uppercase tracking-wider mb-2">
                      Rótulos das Etapas de Montagem:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="admin-step1-label" className="block font-medium text-[#5C4535] mb-1 text-[11px]">
                          Etapa 1 (Tamanho)
                        </label>
                        <input
                          id="admin-step1-label"
                          type="text"
                          value={formSettings.boxModalStep1Label ?? '1. Escolha o Tamanho da Caixa'}
                          onChange={(e) =>
                            setFormSettings({ ...formSettings, boxModalStep1Label: e.target.value })
                          }
                          placeholder="1. Escolha o Tamanho da Caixa"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs font-semibold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                        />
                      </div>

                      <div>
                        <label htmlFor="admin-step2-label" className="block font-medium text-[#5C4535] mb-1 text-[11px]">
                          Etapa 2 (Sabores)
                        </label>
                        <input
                          id="admin-step2-label"
                          type="text"
                          value={formSettings.boxModalStep2Label ?? '2. Escolha os Sabores da Sua Caixa'}
                          onChange={(e) =>
                            setFormSettings({ ...formSettings, boxModalStep2Label: e.target.value })
                          }
                          placeholder="2. Escolha os Sabores da Sua Caixa"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs font-semibold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                        />
                      </div>

                      <div>
                        <label htmlFor="admin-step3-label" className="block font-medium text-[#5C4535] mb-1 text-[11px]">
                          Etapa 3 (Fita)
                        </label>
                        <input
                          id="admin-step3-label"
                          type="text"
                          value={formSettings.boxModalStep3Label ?? '3. Cor do Laço de Fita'}
                          onChange={(e) =>
                            setFormSettings({ ...formSettings, boxModalStep3Label: e.target.value })
                          }
                          placeholder="3. Cor do Laço de Fita"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs font-semibold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                        />
                      </div>

                      <div>
                        <label htmlFor="admin-step4-label" className="block font-medium text-[#5C4535] mb-1 text-[11px]">
                          Etapa 4 (Observações)
                        </label>
                        <input
                          id="admin-step4-label"
                          type="text"
                          value={formSettings.boxModalStep4Label ?? '4. Observações para a Caixa'}
                          onChange={(e) =>
                            setFormSettings({ ...formSettings, boxModalStep4Label: e.target.value })
                          }
                          placeholder="4. Observações para a Caixa"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-[#E2D6C0] text-xs font-semibold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8DFC8]">
                <span className="text-[11px] text-[#7A6453]">
                  Gravado no documento <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E2D6C0] font-mono text-[10px]">configuracoes/loja</code> no Firestore.
                </span>
                <button
                  id="admin-save-boxes-btn"
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#3B2011] hover:bg-[#2B1810] disabled:opacity-50 text-[#FAF7F2] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#E2C799] animate-spin" />
                      <span>Salvando no Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#E2C799]" />
                      <span>Salvar Preços e Textos no Firestore</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Store Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 border border-[#EDE4D2] shadow-xs max-w-2xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8DFC8]">
              <Settings className="w-5 h-5 text-[#8C5D38]" />
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-[#2B1810]">
                  Informações de Atendimento & Loja
                </h3>
                <p className="text-xs text-[#7A6453]">
                  Atualize o WhatsApp de pedidos, horário de funcionamento e avisos
                </p>
              </div>
            </div>

            {settingsSaved && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 shadow-2xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Configurações salvas no Firestore com sucesso! O site público já está atualizado em tempo real.</span>
              </div>
            )}

            {settingsError && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2.5 shadow-2xs">
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                  Número de WhatsApp para Pedidos (com DDD)
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-[#8C735F] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formSettings.whatsapp}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, whatsapp: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="5524992620792"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs font-mono text-[#2D241E] focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-[#8C735F] mt-0.5">
                  Formato: código do país (55) + DDD (24) + número (992620792).
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                  Telefone de Contato (Exibição)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C735F] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formSettings.phone}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, phone: e.target.value })
                    }
                    placeholder="+55 (24) 99262-0792"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                  Horário de Funcionamento
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#8C735F] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formSettings.openingHours}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, openingHours: e.target.value })
                    }
                    placeholder="Segunda a Sábado das 09h às 18h"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                  Endereço / Ponto de Retirada
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8C735F] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formSettings.address}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, address: e.target.value })
                    }
                    placeholder="Ateliê Alfajoraria Andrey - Encomendas & Retiradas"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                  Aviso no Topo do Cardápio
                </label>
                <textarea
                  rows={2}
                  value={formSettings.announcement}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, announcement: e.target.value })
                  }
                  placeholder="Fornada do dia fresca! Encomendas com entrega rápida ou retirada."
                  className="w-full px-3 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white"
                />
              </div>

              {/* Valores das Caixas dentro de Configurações */}
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE1CF] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#3B2011] block">Valores das Caixas de Alfajores</span>
                    <span className="text-[11px] text-[#7A6453]">
                      Preços das caixas personalizadas de 4, 6 e 12 unidades
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('boxes')}
                    className="text-xs text-[#8C5D38] hover:text-[#2B1810] font-bold underline cursor-pointer"
                  >
                    Gerenciar Caixas
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="settings-box4-price" className="block text-[10px] font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                      Caixa 4 unid. (R$)
                    </label>
                    <input
                      id="settings-box4-price"
                      type="number"
                      step="0.10"
                      min="1"
                      value={formSettings.box4Price ?? 62}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          box4Price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#E2D6C0] text-xs font-bold text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#784627]"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-box6-price" className="block text-[10px] font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                      Caixa 6 unid. (R$)
                    </label>
                    <input
                      id="settings-box6-price"
                      type="number"
                      step="0.10"
                      min="1"
                      value={formSettings.box6Price ?? 89}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          box6Price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#E2D6C0] text-xs font-bold text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#784627]"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-box12-price" className="block text-[10px] font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                      Caixa 12 unid. (R$)
                    </label>
                    <input
                      id="settings-box12-price"
                      type="number"
                      step="0.10"
                      min="1"
                      value={formSettings.box12Price ?? 169}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          box12Price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-[#E2D6C0] text-xs font-bold text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#784627]"
                    />
                  </div>
                </div>
              </div>

              {/* Loja Aberta Switch */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EBE1CF] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#3B2011] block">Status da Loja</span>
                  <span className="text-[11px] text-[#7A6453]">
                    {formSettings.isOpen
                      ? 'Loja marcada como aberta para receber pedidos'
                      : 'Loja marcada como fechada no momento'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormSettings({ ...formSettings, isOpen: !formSettings.isOpen })
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    formSettings.isOpen ? 'bg-[#3B2011]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      formSettings.isOpen ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8DFC8]">
                <span className="text-[11px] text-[#7A6453]">
                  Salvo no documento <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E2D6C0] font-mono text-[10px]">configuracoes/loja</code> no Firestore.
                </span>
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#3B2011] hover:bg-[#2B1810] disabled:opacity-50 text-[#FAF7F2] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#E2C799] animate-spin" />
                      <span>Salvando no Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#E2C799]" />
                      <span>Salvar Configurações no Firestore</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Product Form Modal (Add/Edit) */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productToEdit={productToEdit}
        onSave={async (formData, file) => {
          if (productToEdit) {
            await onUpdateProduct(productToEdit.id, formData, file);
          } else {
            await onAddProduct(formData, file);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div
          id="delete-confirm-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            id="delete-confirm-content"
            className="bg-white w-full max-w-sm rounded-3xl p-6 border border-[#E8DEC7] shadow-2xl"
          >
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif-brand text-lg font-bold text-[#2B1810]">
              Confirmar Exclusão
            </h3>
            <p className="text-xs text-[#735A47] mt-1 leading-relaxed">
              Tem certeza que deseja excluir o alfajor <strong>"{productToDelete.name}"</strong>?
              Esta ação removerá o produto do cardápio.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#665040] hover:bg-[#F5EFE6] rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
