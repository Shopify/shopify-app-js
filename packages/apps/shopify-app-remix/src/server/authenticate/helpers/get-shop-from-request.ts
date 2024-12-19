export function getShopFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get('shop')!;
}
