export function formatLkr(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(Number(amount))) return 'Rs 0';
  try {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    const n = Math.round(Number(amount));
    return `Rs ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}


