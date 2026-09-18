import React, { useState, useEffect, useMemo } from 'react';
import {
  Product,
  CartItem,
  CustomBoxItem,
  AuthUser,
  ProductFormData,
  StoreSettings,
} from './types';
import {
  getProducts,
  subscribeToProducts,
  getStoreSettings,
  fetchStoreSettings,
  subscribeToStoreSettings,
  saveStoreSettings,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
} from './services/productService';
import {
  subscribeToAuth,
  signOutAdmin,
  getCurrentAdmin,
} from './services/authService';
import { INITIAL_STORE_SETTINGS } from './data/storeSettings';
import { normalizeCartItem, normalizeCustomBox, syncCartWithProducts } from './utils/cartUtils';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BoxBuilderModal } from './components/BoxBuilderModal';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartBar } from './components/FloatingCartBar';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import {
  Cookie,
  Search,
  Shield,
  ChevronRight,
  Package,
  Sparkles,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

const LOCAL_CART_KEY = 'alfajor_cart_items_v2';
const LOCAL_BOXES_KEY = 'alfajor_cart_boxes_v2';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      return getStoreSettings() || INITIAL_STORE_SETTINGS;
    } catch {
      return INITIAL_STORE_SETTINGS;
    }
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart & Box Builder State com fallback seguro para versões anteriores do localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved =
        localStorage.getItem(LOCAL_CART_KEY) ||
        localStorage.getItem('alfajor_cart_items');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => normalizeCartItem(item))
        .filter((item): item is CartItem => item !== null);
    } catch {
      return [];
    }
  });

  const [customBoxes, setCustomBoxes] = useState<CustomBoxItem[]>(() => {
    try {
      const saved =
        localStorage.getItem(LOCAL_BOXES_KEY) ||
        localStorage.getItem('alfajor_cart_boxes');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((box) => normalizeCustomBox(box))
        .filter((box): box is CustomBoxItem => box !== null);
    } catch {
      return [];
    }
  });

  const [cartSyncNotice, setCartSyncNotice] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBoxBuilderOpen, setIsBoxBuilderOpen] = useState(false);

  // Admin & View State
  const [currentOwner, setCurrentOwner] = useState<AuthUser | null>(getCurrentAdmin());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'menu' | 'admin'>('menu');

  // Load products and store settings directly from Firestore
  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [items, settings] = await Promise.all([
        getProducts(),
        fetchStoreSettings(),
      ]);
      setProducts(items);
      setStoreSettings(settings);
    } catch (err: any) {
      console.error('Erro ao buscar dados do Firestore:', err);
      setLoadError(
        'Não foi possível conectar ao cardápio da Alfajoraria Andrey no momento. Verifique sua conexão com a internet.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    loadData();

    // Subscribe to real-time changes in Firestore products
    const unsubscribeProducts = subscribeToProducts(
      (items) => {
        setProducts(items);
        setLoading(false);
        setLoadError(null);
      },
      (err) => {
        console.warn('Erro na sincronização em tempo real dos produtos:', err);
        if (products.length === 0) {
          setLoadError(
            'Falha na conexão com o Firestore. Por favor, verifique sua conexão ou tente novamente.'
          );
        }
      }
    );

    // Subscribe to real-time changes in Firestore store settings
    const unsubscribeSettings = subscribeToStoreSettings((freshSettings) => {
      setStoreSettings(freshSettings);
    });

    const handleSettingsUpdated = () => {
      setStoreSettings(getStoreSettings());
    };
    window.addEventListener('alfajor_settings_updated', handleSettingsUpdated);

    // Subscribe to Firebase Auth state changes
    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentOwner(user);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
      unsubscribeAuth();
      window.removeEventListener('alfajor_settings_updated', handleSettingsUpdated);
    };
  }, []);

  // Sincronização e limpeza automática do carrinho com os produtos do Firestore
  useEffect(() => {
    if (products.length === 0) return;

    const { syncedCart, removedCount } = syncCartWithProducts(cartItems, products);

    // Valida também caixas de presente montadas
    const validBoxes = customBoxes
      .map((box) => normalizeCustomBox(box, products))
      .filter((b): b is CustomBoxItem => b !== null);

    let hasCartChanges = false;
    if (removedCount > 0 || syncedCart.length !== cartItems.length) {
      hasCartChanges = true;
    } else {
      for (let i = 0; i < syncedCart.length; i++) {
        const fresh = syncedCart[i];
        const old = cartItems[i];
        if (
          fresh.product.price !== old?.product?.price ||
          fresh.product.name !== old?.product?.name ||
          fresh.product.available !== old?.product?.available
        ) {
          hasCartChanges = true;
          break;
        }
      }
    }

    if (hasCartChanges) {
      setCartItems(syncedCart);
      if (removedCount > 0) {
        setCartSyncNotice(
          `${removedCount} ${
            removedCount === 1
              ? 'item descontinuado foi removido'
              : 'itens descontinuados foram removidos'
          } do seu carrinho para manter o pedido atualizado.`
        );
      }
    }

    if (validBoxes.length !== customBoxes.length) {
      setCustomBoxes(validBoxes);
    }
  }, [products]);

  // Persist cart items
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignora erro de cota local
    }
  }, [cartItems]);

  // Persist custom boxes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_BOXES_KEY, JSON.stringify(customBoxes));
    } catch {
      // Ignora erro de cota local
    }
  }, [customBoxes]);

  // Categories list derived from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products for customer view
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'Todos' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.ingredients.some((ing) => ing.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart calculations com proteção contra NaN e undefined
  const totalCartCount = useMemo(() => {
    const itemsCount = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, it) => {
      const qty = Math.max(0, Math.floor(Number(it?.quantity) || 0));
      return acc + qty;
    }, 0);
    const boxesCount = Array.isArray(customBoxes) ? customBoxes.length : 0;
    return itemsCount + boxesCount;
  }, [cartItems, customBoxes]);

  const totalCartPrice = useMemo(() => {
    const itemsTotal = (Array.isArray(cartItems) ? cartItems : []).reduce((sum, item) => {
      const price = Number(item?.product?.price);
      const safePrice = isNaN(price) || price < 0 ? 0 : price;
      const qty = Math.max(0, Math.floor(Number(item?.quantity) || 0));
      return sum + safePrice * qty;
    }, 0);
    const boxesTotal = (Array.isArray(customBoxes) ? customBoxes : []).reduce((sum, box) => {
      const price = Number(box?.price);
      const safePrice = isNaN(price) || price < 0 ? 0 : price;
      return sum + safePrice;
    }, 0);
    return itemsTotal + boxesTotal;
  }, [cartItems, customBoxes]);

  // Cart Actions
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!product || !product.id) return;
    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product?.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product?.id === product.id
            ? { ...item, quantity: (Number(item.quantity) || 1) + safeQty }
            : item
        );
      }
      return [...prev, { product, quantity: safeQty }];
    });
  };

  const handleUpdateCartItemQty = (productId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product?.id === productId) {
            const currentQty = Number(item.quantity) || 1;
            const newQty = currentQty + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((it): it is CartItem => it !== null);
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product?.id !== productId));
  };

  const handleAddBoxToCart = (box: CustomBoxItem) => {
    const normalized = normalizeCustomBox(box, products);
    if (!normalized) return;
    setCustomBoxes((prev) => [normalized, ...prev]);
  };

  const handleRemoveCustomBox = (boxId: string) => {
    setCustomBoxes((prev) => prev.filter((box) => box.id !== boxId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCustomBoxes([]);
    try {
      localStorage.removeItem(LOCAL_CART_KEY);
      localStorage.removeItem(LOCAL_BOXES_KEY);
      localStorage.removeItem('alfajor_cart_items');
      localStorage.removeItem('alfajor_cart_boxes');
    } catch {
      // Ignora erro
    }
  };

  // Admin Flow
  const handleAdminButtonClick = () => {
    if (currentOwner) {
      setCurrentView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setCurrentView('admin');
  };

  const handleLogout = async () => {
    await signOutAdmin();
    setCurrentView('menu');
  };

  // Product CRUD (Mutations require authenticated user in Firestore)
  const handleAddProduct = async (formData: ProductFormData, file: File | null) => {
    const newProd = await createProduct(formData, file);
    setProducts((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
  };

  const handleUpdateProduct = async (id: string, formData: ProductFormData, file: File | null) => {
    const updated = await updateProduct(id, formData, file);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleAvailability = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    await toggleProductAvailability(id, target.available);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
    );
  };

  const handleSaveSettings = async (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    await saveStoreSettings(newSettings);
  };

  // If in Admin View
  if (currentView === 'admin' && currentOwner) {
    return (
      <AdminDashboard
        products={products}
        currentUser={currentOwner}
        settings={storeSettings}
        onLogout={handleLogout}
        onViewMenu={() => setCurrentView('menu')}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleAvailability={handleToggleAvailability}
        onSaveSettings={handleSaveSettings}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2D241E]">
      {/* Header with search & category filters */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        settings={storeSettings}
        cartTotalCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBoxBuilder={() => setIsBoxBuilderOpen(true)}
      />

      {/* Main Catalog Area */}
      <main className="flex-grow w-full max-w-2xl mx-auto px-4 py-5">
        {/* Cart sync notification */}
        {cartSyncNotice && (
          <div className="mb-4 p-3.5 bg-[#FFF9EE] border border-[#E5D2A8] rounded-2xl text-xs text-[#5C3E1B] flex items-center justify-between gap-3 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#8C5D38] shrink-0" />
              <span>{cartSyncNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setCartSyncNotice(null)}
              className="text-[#8C5D38] hover:text-[#2B1810] font-bold text-xs p-1 cursor-pointer"
              aria-label="Fechar aviso"
            >
              ✕
            </button>
          </div>
        )}

        {/* Box Builder Banner */}
        <section
          onClick={() => setIsBoxBuilderOpen(true)}
          className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#2B1810] via-[#3D2214] to-[#452718] text-[#FAF7F2] shadow-md border border-[#E2C799]/30 flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E2C799] text-[#2B1810] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E2C799]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{storeSettings.boxBannerBadge || 'Experiência Artesanal Exclusiva'}</span>
              </div>
              <h2 className="font-serif-brand text-base sm:text-lg font-bold leading-tight mt-0.5">
                {storeSettings.boxBannerTitle || 'Monte Sua Caixa com Seus Sabores Favoritos'}
              </h2>
              <p className="text-[11px] text-[#D8BEA7] mt-0.5 leading-relaxed">
                {storeSettings.boxBannerDescription || 'Massa artesanal macia que derrete na boca, recheio generoso e chocolate nobre. Selecione 4, 6 ou 12 unidades ao seu gosto!'}
              </p>
            </div>
          </div>

          <div className="shrink-0 hidden sm:flex items-center gap-1 bg-[#E2C799] text-[#2B1810] px-3.5 py-1.5 rounded-full text-xs font-extrabold group-hover:bg-[#F3E2C4] transition">
            <span>{storeSettings.boxBannerButtonText || 'Montar Caixa'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </section>

        {/* Section title & count */}
        <div className="flex items-center justify-between py-2 mb-3 border-b border-[#EDE4D2] text-xs">
          <div className="flex items-center gap-1.5 text-[#5C4535]">
            <Cookie className="w-4 h-4 text-[#8C5D38]" />
            <span className="font-bold text-sm text-[#2B1810]">
              {selectedCategory === 'Todos' ? 'Nossos Alfajores Artesanais' : selectedCategory}
            </span>
          </div>
          <span className="text-[#8C735F] text-xs font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'sabor' : 'sabores'}
          </span>
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#3B2011] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-[#735A47]">Carregando cardápio fresco do Firestore...</p>
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-amber-200/90 my-8 shadow-xs max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="font-serif-brand text-base font-bold text-[#2B1810]">
              Conexão com o Cardápio
            </h3>
            <p className="text-xs text-[#7A6453] mt-1.5 mb-4 leading-relaxed">
              {loadError}
            </p>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2] text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#E8DFC8] my-8 shadow-xs">
            <Search className="w-10 h-10 text-[#C4B29E] mx-auto mb-2" />
            <h3 className="font-serif-brand text-base font-bold text-[#2B1810]">
              Nenhum sabor encontrado
            </h3>
            <p className="text-xs text-[#7A6453] mt-1 mb-4">
              Não encontramos resultados para sua busca atual.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
              }}
              className="text-xs font-semibold text-[#3B2011] bg-[#F5EFE6] px-4 py-2 rounded-xl border border-[#E2D6C0] hover:bg-[#EBDDC9] transition cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(prod) => setSelectedProduct(prod)}
                onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
              />
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <FAQSection />

        {/* Floating Quick Bar for Admin if logged in */}
        {currentOwner && (
          <div className="my-6 p-4 bg-[#2B1810] text-[#FAF7F2] rounded-2xl shadow-lg flex items-center justify-between border border-[#E2C799]/30">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#E2C799]" />
              <div>
                <p className="text-xs font-bold">Você está logado como Dono</p>
                <p className="text-[11px] text-[#D4BCA3]">{currentOwner.email}</p>
              </div>
            </div>
            <button
              id="quick-open-admin-btn"
              type="button"
              onClick={() => setCurrentView('admin')}
              className="px-3.5 py-1.5 bg-[#E2C799] hover:bg-[#D6B782] text-[#2B1810] text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <span>Painel</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (shows when items are in cart) */}
      <ErrorBoundary fallbackTitle="Instabilidade na barra do carrinho" onClearCart={handleClearCart}>
        <FloatingCartBar
          totalCount={totalCartCount}
          totalPrice={totalCartPrice}
          onOpenCart={() => setIsCartOpen(true)}
        />
      </ErrorBoundary>

      {/* Footer */}
      <Footer
        onOpenAdmin={handleAdminButtonClick}
        isAdminLoggedIn={!!currentOwner}
        settings={storeSettings}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qty) => handleAddToCart(product, qty)}
        />
      )}

      {/* Box Builder Modal */}
      <BoxBuilderModal
        isOpen={isBoxBuilderOpen}
        onClose={() => setIsBoxBuilderOpen(false)}
        products={products}
        onAddBoxToCart={handleAddBoxToCart}
        settings={storeSettings}
      />

      {/* Cart Drawer wrapped in ErrorBoundary with automatic data recovery */}
      <ErrorBoundary
        key={isCartOpen ? 'cart-drawer-open' : 'cart-drawer-closed'}
        isModal={true}
        fallbackTitle="Ops, algo deu errado com o carrinho"
        fallbackMessage="Detectamos dados incompatíveis no histórico do seu pedido. Você pode restaurar o carrinho ou limpar os itens para prosseguir normalmente."
        onReset={() => setIsCartOpen(false)}
        onClearCart={handleClearCart}
      >
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          cartItems={cartItems}
          boxes={customBoxes}
          customBoxes={customBoxes}
          onUpdateQuantity={handleUpdateCartItemQty}
          onUpdateCartItemQty={handleUpdateCartItemQty}
          onRemoveItem={handleRemoveCartItem}
          onRemoveCartItem={handleRemoveCartItem}
          onRemoveBox={handleRemoveCustomBox}
          onRemoveCustomBox={handleRemoveCustomBox}
          onClearCart={handleClearCart}
          settings={storeSettings}
          availableProducts={products}
        />
      </ErrorBoundary>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
