export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    // Suggest expecting YYYY-MM-DD from input type="date"
    const date = new Date(dateStr + 'T12:00:00'); // append time to avoid timezone offsets shifting the day
    if (isNaN(date.getTime())) return dateStr; // fallback if parsing fails
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
