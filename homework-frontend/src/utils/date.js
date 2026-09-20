export const toLocalDateString = (dateInput) => {
    const d = new Date(dateInput);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export const parseLocalDate = (str) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
};