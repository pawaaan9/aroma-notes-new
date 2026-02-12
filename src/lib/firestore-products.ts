import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/types/product";

/**
 * Fetch all products from Firestore and map to the Product type.
 */
export async function fetchAllProducts(): Promise<Product[]> {
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
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
    } as Product;
  });
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
  };
}
