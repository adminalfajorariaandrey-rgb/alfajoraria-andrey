export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  ingredients: string[];
  imageUrl: string;
  category: string;
  available: boolean;
  featured?: boolean;
  badge?: string;
  createdAt?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomBoxSelection {
  productId: string;
  productName: string;
  quantity: number;
}

export interface CustomBoxItem {
  id: string;
  title: string;
  boxSize: 4 | 6 | 12;
  items: CustomBoxSelection[];
  ribbonColor: string;
  giftCardMessage?: string;
  price: number;
  imageUrl: string;
}

export type OrderDeliveryMethod = 'pickup' | 'delivery';
export type OrderPaymentMethod = 'pix' | 'card' | 'cash';

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  deliveryMethod: OrderDeliveryMethod;
  address?: string;
  neighborhood?: string;
  complement?: string;
  paymentMethod: OrderPaymentMethod;
  giftPackaging?: boolean;
  notes?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface ProductFormData {
  name: string;
  price: number;
  description: string;
  ingredients: string;
  imageUrl: string;
  category: string;
  available: boolean;
  badge?: string;
}

export interface StoreSettings {
  phone: string;
  whatsapp: string;
  openingHours: string;
  address: string;
  announcement: string;
  isOpen: boolean;
  deliveryNote: string;
  box4Price?: number;
  box6Price?: number;
  box12Price?: number;

  // Textos do Banner "Monte Sua Caixa"
  boxBannerBadge?: string;
  boxBannerTitle?: string;
  boxBannerDescription?: string;
  boxBannerButtonText?: string;

  // Textos do Modal "Monte Sua Caixa"
  boxModalTitle?: string;
  boxModalSubtitle?: string;
  boxModalStep1Label?: string;
  boxModalStep2Label?: string;
  boxModalStep3Label?: string;
  boxModalStep4Label?: string;
}

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
