export const formatPrice = (amount) => {
  return `₨ ${Number(amount).toLocaleString("en-PK")}`;
};