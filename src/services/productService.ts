import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { Product, ProductFormData, StoreSettings } from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/storeSettings';
import { compressImage } from './imageUtils';

const COLLECTION_NAME = 'produtos';
const LOCAL_SETTINGS_KEY = 'alfajor_store_settings_v2';

// ----------------------------------------------------
// Leitura e Escuta em Tempo Real dos Produtos do Firestore
// ----------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const items: Product[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Product;
      items.push({
        ...data,
        id: docSnap.id,
      });
    });

    // Ordena por data de criação ou alfabética
    return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.warn('Não foi possível ler produtos do Firestore:', error);
    return [];
  }
}

// Assinatura em tempo real para sincronizar mudanças instantaneamente
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: any) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Product;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onUpdate(items);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      console.warn('Erro ao sincronizar produtos em tempo real:', error);
    }
  );
}

// ----------------------------------------------------
// Processamento de Imagem
// ----------------------------------------------------

export async function processProductImage(
  file?: File | null,
  existingUrl?: string
): Promise<string> {
  if (file) {
    return await compressImage(file, 800, 0.82);
  }
  if (existingUrl && existingUrl.trim()) {
    return existingUrl.trim();
  }
  return '/logo_andrey.svg';
}

// ----------------------------------------------------
// Mutações no Firestore (Exclusivo para Usuário Autenticado)
// ----------------------------------------------------

function requireAuth(): void {
  if (!auth.currentUser) {
    throw new Error('Apenas administradores autenticados podem realizar alterações no cardápio.');
  }
}

export async function createProduct(
  formData: ProductFormData,
  file?: File | null
): Promise<Product> {
  requireAuth();

  const imageUrl = await processProductImage(file, formData.imageUrl);
  const ingredientsList = formData.ingredients
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const docId = 'prod-' + Date.now();
  const productRef = doc(db, COLLECTION_NAME, docId);

  const newProduct: Product = {
    id: docId,
    name: formData.name.trim(),
    price: Number(formData.price),
    description: formData.description.trim(),
    ingredients: ingredientsList,
    imageUrl,
    category: formData.category || 'Especiais',
    available: formData.available !== false,
    badge: formData.badge?.trim() || undefined,
    createdAt: Date.now(),
  };

  try {
    await setDoc(productRef, newProduct);
    return newProduct;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${docId}`);
  }
}

export async function updateProduct(
  id: string,
  formData: ProductFormData,
  file?: File | null
): Promise<Product> {
  requireAuth();

  const imageUrl = await processProductImage(file, formData.imageUrl);
  const ingredientsList = formData.ingredients
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const productRef = doc(db, COLLECTION_NAME, id);

  const updatedFields = {
    name: formData.name.trim(),
    price: Number(formData.price),
    description: formData.description.trim(),
    ingredients: ingredientsList,
    imageUrl,
    category: formData.category || 'Especiais',
    available: formData.available,
    badge: formData.badge?.trim() || '',
  };

  try {
    await updateDoc(productRef, updatedFields);
    return {
      id,
      ...updatedFields,
      createdAt: Date.now(),
    } as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function toggleProductAvailability(
  id: string,
  currentAvailable: boolean
): Promise<void> {
  requireAuth();
  const productRef = doc(db, COLLECTION_NAME, id);
  try {
    await updateDoc(productRef, { available: !currentAvailable });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  requireAuth();
  const productRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(productRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

// ----------------------------------------------------
// Configurações da Loja (Persistidas no Firestore)
// Coleção: configuracoes, Documento: loja
// ----------------------------------------------------

const SETTINGS_COLLECTION = 'configuracoes';
const SETTINGS_DOC_ID = 'loja';

// Leitura síncrona do cache local para renderização inicial rápida sem flash
export function getCachedStoreSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      return { ...INITIAL_STORE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Erro ao ler configurações em cache local:', e);
  }
  return INITIAL_STORE_SETTINGS;
}

// Mantido para compatibilidade síncrona
export function getStoreSettings(): StoreSettings {
  return getCachedStoreSettings();
}

// Busca direta e assíncrona do documento no Firestore
export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<StoreSettings>;
      const merged: StoreSettings = { ...INITIAL_STORE_SETTINGS, ...data };
      try {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged));
      } catch {}
      return merged;
    }
  } catch (error) {
    console.warn('Não foi possível ler configurações do Firestore, usando fallback:', error);
  }
  return getCachedStoreSettings();
}

// Escuta em tempo real no documento loja da coleção configuracoes
export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  onError?: (error: any) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<StoreSettings>;
        const merged: StoreSettings = { ...INITIAL_STORE_SETTINGS, ...data };
        try {
          localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged));
        } catch {}
        onUpdate(merged);
      } else {
        onUpdate(INITIAL_STORE_SETTINGS);
      }
    },
    (err) => {
      console.warn('Erro na sincronização em tempo real das configurações:', err);
      if (onError) onError(err);
    }
  );
}

// Salva configurações no Firestore
export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  requireAuth();
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  try {
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
    window.dispatchEvent(new Event('alfajor_settings_updated'));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
    throw error;
  }
}
