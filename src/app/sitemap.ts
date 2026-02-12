import type { MetadataRoute } from 'next';
import { fetchProducts } from '@/lib/sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/products',
    '/about',
    '/privacy',
    '/terms',
    '/return-policy',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const products = await fetchProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => {
    const slug = p.slug?.current ?? p._id;
    return {
      url: `${baseUrl}/product-view/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...productRoutes];
}


