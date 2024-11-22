export const getProductType = (product) => {
  if (product?.product_id) {
    return "variant";
  } else {
    return "product";
  }
};
