export const extractPrice = (...elements: any) => {
  for (let element of elements) {
    const price = element.text().trim();
    if (price) return price.replace(/[^\d.]/g, "");
  }
  return "";
};

export const extractCurrency = (element: any) => {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
};
