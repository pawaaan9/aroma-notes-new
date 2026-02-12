export type SanityVariant = {
  size?: string;
  price?: number | null;
  discountPrice?: number | null;
  photoUrl?: string | null;
  inStock?: boolean | null;
};

export type SanityProduct = {
  _id: string;
  name: string;
  slug?: { current?: string } | null;
  brand?: string | null;
  coverImageUrl?: string | null;
  variants?: SanityVariant[] | null;
  description?: unknown;
  descriptionText?: string | null;
  mainAccords?: Array<{
    name?: string | null;
    percentage?: number | null;
    color?: { hex?: string | null } | null;
  }> | null;
  gender?: 'male' | 'female' | 'unisex' | null;
  perfumeType?: 'originals' | 'inspired' | null;
};

const SANITY_PROJECT_ID = 'ief0s3av';
const SANITY_DATASET = 'production';
// Sanity API requires the version be prefixed with a 'v' in the REST path
const SANITY_API_VERSION = 'v2023-10-01';

function buildQueryUrl(groqQuery: string): string {
  const base = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;
  const params = new URLSearchParams({ query: groqQuery });
  return `${base}?${params.toString()}`;
}

export async function fetchProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product"]{
    _id,
    name,
    slug,
    brand,
    gender,
    perfumeType,
    "coverImageUrl": coverImage.asset->url,
    variants[]{
      size,
      price,
      discountPrice,
      inStock,
      "photoUrl": photo.asset->url
    }
  } | order(name asc)`;

  const url = buildQueryUrl(query);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch products from Sanity: ${res.status}`);
  }
  const json = await res.json();
  return (json?.result ?? []) as SanityProduct[];
}

export function selectPrimaryImage(product: SanityProduct): string | null {
  if (product.coverImageUrl) return product.coverImageUrl;
  const firstVariantWithPhoto = product.variants?.find(v => Boolean(v.photoUrl));
  return firstVariantWithPhoto?.photoUrl ?? null;
}

export function selectDisplayPrice(product: SanityProduct): number | null {
  const effectivePrices = (product.variants ?? [])
    .map(v => (v.discountPrice != null ? v.discountPrice : v.price))
    .filter((v): v is number => typeof v === 'number');
  if (effectivePrices.length === 0) return null;
  return Math.min(...effectivePrices);
}

export function select50mlVariant(product: SanityProduct): SanityVariant | null {
  const variant50ml = product.variants?.find(v => v.size === '50ml');
  return variant50ml ?? null;
}

export function select50mlPrice(product: SanityProduct): { discountPrice?: number | null; originalPrice?: number | null } {
  const variant = select50mlVariant(product);
  if (!variant) return {};
  return {
    discountPrice: variant.discountPrice,
    originalPrice: variant.price
  };
}

export function select100mlVariant(product: SanityProduct): SanityVariant | null {
  const variant100ml = product.variants?.find(v => v.size === '100ml');
  return variant100ml ?? null;
}

export function select100mlPrice(product: SanityProduct): { discountPrice?: number | null; originalPrice?: number | null } {
  const variant = select100mlVariant(product);
  if (!variant) return {};
  return {
    discountPrice: variant.discountPrice,
    originalPrice: variant.price
  };
}

export async function fetchProductByIdOrSlug(idOrSlug: string): Promise<SanityProduct | null> {
  const query = `*[_type == "product" && (_id == $idOrSlug || slug.current == $idOrSlug)][0]{
    _id,
    name,
    slug,
    brand,
    "coverImageUrl": coverImage.asset->url,
    variants[]{
      size,
      price,
      discountPrice,
      inStock,
      "photoUrl": photo.asset->url
    },
    description,
    "descriptionText": pt::text(description),
    mainAccords[]{name, percentage, color}
  }`;

  // Encode parameters into the URL for the REST query
  const base = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;
  const params = new URLSearchParams({ query });
  // Sanity supports $var via URL param of the same name prefixed with $;
  // we can pass JSON-stringified values
  params.append("$idOrSlug", JSON.stringify(idOrSlug));
  const url = `${base}?${params.toString()}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.result ?? null) as SanityProduct | null;
}


