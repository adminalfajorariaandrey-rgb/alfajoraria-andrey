export function formatCurrencyBRL(value: number | string | undefined | null): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? 0).replace(',', '.'));
  const safeNum = isNaN(num) || !isFinite(num) ? 0 : num;
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(safeNum);
  } catch {
    return `R$ ${safeNum.toFixed(2).replace('.', ',')}`;
  }
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneBR(phone: string): string {
  const digits = cleanPhone(phone);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
