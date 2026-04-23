// Currency formatter — converts numeric values to "$1,234,567" style strings.
export const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
