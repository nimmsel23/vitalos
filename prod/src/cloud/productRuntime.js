/** Product builds must never use this computer's personal backend services. */
export const isProductBuild = () => import.meta.env?.VITE_VOS_PRODUCT_BUILD === '1';

export function relaxApiBase(hostname, product = isProductBuild()) {
  if (product) return '/relax-api';
  return hostname.includes('web.app') || hostname.includes('firebaseapp.com')
    ? 'https://ideapad.tail7a15d6.ts.net/relax-api'
    : '/relax-api';
}
