// Most apps would load this from their database
export function getOffers(shop: string, customerID: string) {
  const offers: Record<string, any[]> = {
    'shop.com': [
      {
        id: '1',
        title: '10% off',
        price: 10,
        type: 'percentage',
        customerId: 'gid://shopify/Customer/1001',
      },
      {
        id: '2',
        title: 'Free shipping',
        price: 0,
        type: 'shipping',
        customerId: 'gid://shopify/Customer/1001',
      },
      {
        id: '3',
        title: '5% off',
        price: 5,
        type: 'percentage',
        customerId: 'gid://shopify/Customer/1001',
      },
    ],
  };

  const allOffers = offers[shop] || [];
  // Filter offers to include only those that match the customerId
  const filteredOffers = allOffers.filter(
    (offer) => offer.customerId === customerID,
  );

  return filteredOffers;
}
