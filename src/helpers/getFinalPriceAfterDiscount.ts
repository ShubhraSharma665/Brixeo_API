export const getFinalPrice = (
  itemPrice: number,
  totalPrice: number,
  discountAmount: number,
): number => {
  let discountForItem: number = 0;

  console.log(
    itemPrice,
    typeof itemPrice,
    totalPrice,
    typeof totalPrice,
    discountAmount,
    typeof totalPrice,
  );

  if (!!discountAmount && discountAmount !== 0) {
    discountForItem = (itemPrice / totalPrice) * discountAmount;
  }

  const finalItemPrice = itemPrice - discountForItem;

  return Math.round(finalItemPrice * 100) / 100;
};

export const getAdminAndProviderCut = (finalPrice, adminCommission) => {
  const cut = finalPrice * (adminCommission / 100);
  const adminCut = Math.round(cut * 100) / 100;

  const providerCut = Math.round((finalPrice - adminCut) * 100) / 100;

  return {
    provider: providerCut,
    admin: adminCut,
  };
};
