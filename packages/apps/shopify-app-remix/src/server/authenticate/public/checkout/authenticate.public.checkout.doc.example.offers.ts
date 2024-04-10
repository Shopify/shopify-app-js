// Most apps would load this from their database
export function getOffers(shop: string) {
  const offers: Record<any, any[]> = {
    'shop.com': [
      {
        id: '1',
        title: '10% off',
        price: 10,
        type: 'percentage',
      },
      {
        id: '2',
        title: 'Free shipping',
        price: 0,
        type: 'shipping',
      },
    ],
  };

  return offers[shop];
}
