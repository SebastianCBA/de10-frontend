export const formatPrice = (value, currencySymbol = "$", locale = "es-AR") => {
const amount = Number(value ?? 0);

return `${currencySymbol}${amount.toLocaleString(locale, {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
})}`;
};