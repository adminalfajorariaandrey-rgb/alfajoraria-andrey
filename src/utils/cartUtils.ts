import { Product, CartItem, CustomBoxItem, CustomBoxSelection } from '../types';

const DEFAULT_FALLBACK_IMAGE = '/logo_andrey.svg';

/**
 * Normaliza um item de carrinho garantindo integridade de tipos,
 * compatibilidade com estruturas antigas/novas do localStorage
 * e fallback para produtos carregados do Firestore.
 */
export function normalizeCartItem(
  rawItem: any,
  availableProducts?: Product[]
): CartItem | null {
  if (!rawItem || typeof rawItem !== 'object') {
    return null;
  }

  // Identifica o id e o produto tanto no formato aninhado (item.product)
  // quanto em formatos planos antigos (item.id ou item.productId)
  const rawProduct = rawItem.product && typeof rawItem.product === 'object'
    ? rawItem.product
    : rawItem;

  const rawId = String(
    rawProduct.id || rawItem.productId || rawItem.id || ''
  ).trim();

  const rawName = String(
    rawProduct.name || rawItem.productName || rawItem.name || ''
  ).trim();

  if (!rawId && !rawName) {
    return null;
  }

  // Se houver catálogo de produtos disponível do Firestore, busca o produto correspondente
  // por ID direto ou por nome exato (caso o ID tenha mudado na migração)
  let currentProduct: Product | undefined;
  if (availableProducts && availableProducts.length > 0) {
    currentProduct =
      availableProducts.find((p) => p.id === rawId) ||
      availableProducts.find(
        (p) => rawName && p.name.toLowerCase().trim() === rawName.toLowerCase()
      );
  }

  const rawPrice = currentProduct ? currentProduct.price : rawProduct.price;
  const priceNum =
    typeof rawPrice === 'number'
      ? rawPrice
      : parseFloat(String(rawPrice ?? 0).replace(',', '.'));
  const safePrice = isNaN(priceNum) || priceNum < 0 ? 0 : priceNum;

  const safeQuantity = Math.max(1, Math.floor(Number(rawItem.quantity) || 1));

  const product: Product = {
    id: currentProduct?.id || rawId || 'item-' + Math.random().toString(36).slice(2, 8),
    name: currentProduct?.name || rawName || 'Alfajor Artesanal',
    price: safePrice,
    description: currentProduct?.description || String(rawProduct.description || '').trim(),
    ingredients: currentProduct?.ingredients || (Array.isArray(rawProduct.ingredients) ? rawProduct.ingredients : []),
    imageUrl: currentProduct?.imageUrl || rawProduct.imageUrl || DEFAULT_FALLBACK_IMAGE,
    category: currentProduct?.category || rawProduct.category || 'Alfajores Artesanais',
    available: currentProduct !== undefined ? currentProduct.available : (rawProduct.available !== false),
    featured: currentProduct?.featured ?? rawProduct.featured,
    badge: currentProduct?.badge || rawProduct.badge,
    createdAt: currentProduct?.createdAt || rawProduct.createdAt,
  };

  return {
    product,
    quantity: safeQuantity,
  };
}

/**
 * Normaliza caixas montadas personalizadas (CustomBoxItem)
 */
export function normalizeCustomBox(
  rawBox: any,
  availableProducts?: Product[]
): CustomBoxItem | null {
  if (!rawBox || typeof rawBox !== 'object') {
    return null;
  }

  const boxId = String(rawBox.id || 'box-' + Math.random().toString(36).slice(2, 8)).trim();
  const rawSize = Number(rawBox.boxSize);
  const boxSize = (rawSize === 4 || rawSize === 6 || rawSize === 12 ? rawSize : 6) as 4 | 6 | 12;

  const rawPrice =
    typeof rawBox.price === 'number'
      ? rawBox.price
      : parseFloat(String(rawBox.price ?? 0).replace(',', '.'));
  const safePrice = isNaN(rawPrice) || rawPrice < 0 ? 0 : rawPrice;

  const rawItems = Array.isArray(rawBox.items) ? rawBox.items : [];
  const safeItems: CustomBoxSelection[] = rawItems
    .map((it: any) => {
      if (!it || typeof it !== 'object') return null;
      const pid = String(it.productId || it.id || '').trim();
      let name = String(it.productName || it.name || 'Alfajor').trim();
      if (availableProducts && availableProducts.length > 0) {
        const match =
          availableProducts.find((p) => p.id === pid) ||
          availableProducts.find(
            (p) => name && p.name.toLowerCase().trim() === name.toLowerCase()
          );
        if (match) name = match.name;
      }
      const qty = Math.max(1, Math.floor(Number(it.quantity) || 1));
      return {
        productId: pid || 'item',
        productName: name,
        quantity: qty,
      };
    })
    .filter((it): it is CustomBoxSelection => it !== null);

  return {
    id: boxId,
    title: String(rawBox.title || `Caixa com ${boxSize} Alfajores`).trim(),
    boxSize,
    items: safeItems,
    ribbonColor: String(rawBox.ribbonColor || 'Dourado Elegante').trim(),
    giftCardMessage: rawBox.giftCardMessage ? String(rawBox.giftCardMessage).trim() : undefined,
    price: safePrice,
    imageUrl: rawBox.imageUrl || DEFAULT_FALLBACK_IMAGE,
  };
}

/**
 * Sincroniza e limpa a lista de itens com base nos produtos atuais do catálogo Firestore
 */
export function syncCartWithProducts(
  currentCart: CartItem[],
  availableProducts: Product[]
): {
  syncedCart: CartItem[];
  removedCount: number;
} {
  if (!availableProducts || availableProducts.length === 0) {
    // Catálogo ainda não carregou do Firestore; não descarta para não perder os dados
    const safeCart = (Array.isArray(currentCart) ? currentCart : [])
      .map((item) => normalizeCartItem(item))
      .filter((item): item is CartItem => item !== null);
    return { syncedCart: safeCart, removedCount: 0 };
  }

  let removedCount = 0;
  const syncedCart: CartItem[] = [];

  for (const item of currentCart) {
    const rawProd: any = (item as any)?.product || item;
    const pid = String(rawProd?.id || (item as any)?.productId || '').trim();
    const name = String(rawProd?.name || (item as any)?.productName || '').toLowerCase().trim();

    // Verifica se o produto ainda existe na base do Firestore (por ID ou por nome)
    const exists = availableProducts.some(
      (p) => p.id === pid || (name && p.name.toLowerCase().trim() === name)
    );

    if (!exists) {
      removedCount++;
    } else {
      const normalized = normalizeCartItem(item, availableProducts);
      if (normalized) {
        syncedCart.push(normalized);
      } else {
        removedCount++;
      }
    }
  }

  return { syncedCart, removedCount };
}
