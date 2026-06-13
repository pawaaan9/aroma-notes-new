import { collection, getDocs, query, where, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/types/product";

function toDate(v: unknown): Date | undefined {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return undefined;
}

function compareProductName(a: Product, b: Product): number {
  return (a.name ?? "").localeCompare(b.name ?? "", "en", { sensitivity: "base" });
}

/**
 * Fetch all products from Firestore and map to the Product type.
 * Sorted A–Z by product name.
 */
export async function fetchAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "products"));
  const products = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      _id: d.id,
      name: data.name ?? "",
      slug: data.slug ?? null,
      brand: data.brand ?? null,
      gender: data.gender ?? null,
      perfumeType: data.perfumeType ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      descriptionText: data.descriptionText ?? null,
      variants: (data.variants ?? []).map((v: Record<string, unknown>) => ({
        size: (v.size as string) ?? null,
        price: (v.price as number) ?? null,
        discountPrice: (v.discountPrice as number) ?? null,
        inStock: (v.inStock as boolean) ?? false,
        photoUrl: (v.photoUrl as string) ?? null,
      })),
      mainAccords: data.mainAccords ?? null,
      createdAt: toDate(data.createdAt),
    } as Product;
  });
  return products.sort(compareProductName);
}

/**
 * Fetch related products (same brand, type, or gender) excluding the current one.
 */
export async function fetchRelatedProducts(currentProduct: Product, limit = 6): Promise<Product[]> {
  const all = await fetchAllProducts();
  const filtered = all.filter((p) => p._id !== currentProduct._id);
  const scored = filtered.map((p) => {
    let score = 0;
    if (currentProduct.brand && p.brand && p.brand.toLowerCase() === currentProduct.brand.toLowerCase()) score += 3;
    if (currentProduct.perfumeType && p.perfumeType === currentProduct.perfumeType) score += 2;
    if (currentProduct.gender && p.gender === currentProduct.gender) score += 1;
    return { product: p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
}

/**
 * Fetch a single product by its Firestore document ID or slug.
 */
export async function fetchProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  // First try by document ID
  const docRef = doc(db, "products", idOrSlug);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return mapDocToProduct(docSnap.id, docSnap.data());
  }

  // Fallback: search by slug
  const q = query(collection(db, "products"), where("slug.current", "==", idOrSlug));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const d = snapshot.docs[0];
    return mapDocToProduct(d.id, d.data());
  }

  return null;
}

function mapDocToProduct(id: string, data: Record<string, unknown>): Product {
  return {
    _id: id,
    name: (data.name as string) ?? "",
    slug: (data.slug as { current: string }) ?? null,
    brand: (data.brand as string) ?? null,
    gender: (data.gender as Product["gender"]) ?? null,
    perfumeType: (data.perfumeType as Product["perfumeType"]) ?? null,
    coverImageUrl: (data.coverImageUrl as string) ?? null,
    descriptionText: (data.descriptionText as string) ?? null,
    variants: ((data.variants as Record<string, unknown>[]) ?? []).map((v) => ({
      size: (v.size as string) ?? null,
      price: (v.price as number) ?? null,
      discountPrice: (v.discountPrice as number) ?? null,
      inStock: (v.inStock as boolean) ?? false,
      photoUrl: (v.photoUrl as string) ?? null,
    })),
    mainAccords: (data.mainAccords as Product["mainAccords"]) ?? undefined,
    createdAt: toDate(data.createdAt),
  };
}
