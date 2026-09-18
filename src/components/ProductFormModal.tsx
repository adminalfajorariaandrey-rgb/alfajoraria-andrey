import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductFormData } from '../types';
import { X, Upload, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData, file: File | null) => Promise<void>;
  productToEdit: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [category, setCategory] = useState('Chocolates Nobres');
  const [available, setAvailable] = useState(true);
  const [badge, setBadge] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPrice(productToEdit.price.toString());
      setDescription(productToEdit.description);
      setIngredients(productToEdit.ingredients.join(', '));
      setCategory(productToEdit.category || 'Chocolates Nobres');
      setAvailable(productToEdit.available);
      setBadge(productToEdit.badge || '');
      setImagePreview(productToEdit.imageUrl);
      setImageUrlInput(productToEdit.imageUrl);
      setSelectedFile(null);
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setIngredients('');
      setCategory('Chocolates Nobres');
      setAvailable(true);
      setBadge('');
      setImagePreview('');
      setImageUrlInput('');
      setSelectedFile(null);
    }
    setErrorMsg(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Por favor selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setImageUrlInput('');
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setImageUrlInput('');
      setErrorMsg(null);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrlInput(url);
    setImagePreview(url);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (!name.trim()) {
      setErrorMsg('Por favor, informe o Nome do alfajor.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg('Por favor, informe um Preço válido (ex: 14.50).');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Por favor, informe a Descrição do produto.');
      return;
    }
    if (!ingredients.trim()) {
      setErrorMsg('Por favor, informe a lista de Ingredientes.');
      return;
    }
    if (!imagePreview && !selectedFile && !imageUrlInput.trim()) {
      setErrorMsg('Por favor, faça upload ou forneça uma imagem para o alfajor.');
      return;
    }

    try {
      setSaving(true);
      await onSave(
        {
          name: name.trim(),
          price: parsedPrice,
          description: description.trim(),
          ingredients: ingredients.trim(),
          imageUrl: imageUrlInput.trim() || imagePreview,
          category,
          available,
          badge: badge.trim() || undefined,
        },
        selectedFile
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao salvar o alfajor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="product-form-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="product-form-modal-content"
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#E8DEC7] my-6 relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#EBE3D3] flex items-center justify-between bg-[#FAF7F2] shrink-0">
          <div>
            <h3 className="font-serif-brand text-xl font-bold text-[#2B1810]">
              {productToEdit ? 'Editar Alfajor' : 'Novo Alfajor no Cardápio'}
            </h3>
            <p className="text-xs text-[#7A6453]">
              Os dados e foto serão atualizados instantaneamente no cardápio
            </p>
          </div>
          <button
            id="close-product-form-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8C735F] hover:text-[#2B1810] rounded-full hover:bg-[#F0E8DC] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-grow text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
              Nome do Alfajor *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Alfajor de Pistache com Doce de Leite"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-sm text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
            />
          </div>

          {/* Preço e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                Preço (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-[#7A6453]">
                  R$
                </span>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="15.00"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-sm font-semibold text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs font-medium text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
              >
                <option value="Chocolates Nobres">Chocolates Nobres</option>
                <option value="Linha Tradicional">Linha Tradicional</option>
                <option value="Especiais">Especiais</option>
                <option value="Edição Limitada">Edição Limitada</option>
                <option value="Caixas & Kits">Caixas & Kits</option>
                <option value="Kits & Presentes">Kits & Coleções</option>
              </select>
            </div>
          </div>

          {/* Badge Opcional */}
          <div>
            <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
              Destaque / Selo Promocional <span className="font-normal text-[#8C735F]">(Opcional)</span>
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="ex: Mais Vendido, Novidade, Edição Limitada"
              className="w-full px-3.5 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
            />
          </div>

          {/* Descrição Curta */}
          <div>
            <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
              Descrição Curta *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o biscoito, a textura do recheio de doce de leite e a casquinha..."
              className="w-full px-3.5 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
            />
          </div>

          {/* Ingredientes */}
          <div>
            <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
              Ingredientes * <span className="font-normal text-[#8C735F]">(separados por vírgula)</span>
            </label>
            <textarea
              required
              rows={2}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="ex: Doce de Leite Artesanal, Chocolate Belga 54%, Manteiga Extra, Ovos Caipiras, Baunilha"
              className="w-full px-3.5 py-2 bg-[#FAF7F2] rounded-xl border border-[#E2D6C0] text-xs text-[#2D241E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#784627]"
            />
          </div>

          {/* Imagem do Alfajor */}
          <div>
            <label className="block font-bold text-[#4D382A] uppercase tracking-wider mb-1">
              Foto do Alfajor *
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D6C7B2] hover:border-[#8C5D38] bg-[#FAF7F2] hover:bg-[#F5EDE1] rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center relative overflow-hidden group min-h-[120px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="w-full flex items-center justify-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-16 object-cover rounded-xl shadow-xs border border-[#E2D6C0]"
                  />
                  <div className="text-left">
                    <p className="font-bold text-[#3B2011]">Foto Carregada</p>
                    <p className="text-[11px] text-[#735A47]">Clique para trocar a imagem</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-[#EADECB] text-[#594232] flex items-center justify-center mb-1.5">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-[#3B2011]">
                    Clique para selecionar ou arraste o arquivo aqui
                  </p>
                  <p className="text-[10px] text-[#8C735F] mt-0.5">
                    Otimização automática de resolução
                  </p>
                </>
              )}
            </div>

            {/* Alternative image URL input */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-[#8C735F] shrink-0">Ou URL da web:</span>
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://exemplo.com/foto-alfajor.jpg"
                className="flex-grow px-2.5 py-1.5 bg-[#FAF7F2] rounded-lg border border-[#E2D6C0] text-[11px] text-[#2D241E] focus:bg-white"
              />
            </div>
          </div>

          {/* Disponibilidade */}
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3D3] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#4D382A] block">
                Disponibilidade no Cardápio
              </span>
              <span className="text-[11px] text-[#7A6453]">
                {available ? 'Disponível para os clientes pedirem' : 'Marcado como esgotado hoje'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                available ? 'bg-[#3B2011]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  available ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#F0E8D9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#665040] hover:text-[#2B1810] rounded-xl hover:bg-[#F5EFE6] transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#3B2011] hover:bg-[#2B1810] text-[#FAF7F2] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition disabled:opacity-70 cursor-pointer"
            >
              {saving ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#E2C799]" />
                  <span>{productToEdit ? 'Atualizar Alfajor' : 'Publicar Alfajor'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
