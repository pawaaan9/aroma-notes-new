export type ProductVariant = {
  size?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  inStock?: boolean;
  photoUrl?: string | null;
};

export type Product = {
  _id: string;
  name: string;
  slug?: { current: string } | null;
  brand?: string | null;
  gender?: "female" | "male" | "unisex" | null;
  perfumeType?: "originals" | "inspired" | null;
  variants?: ProductVariant[];
  coverImageUrl?: string | null;
  descriptionText?: string | null;
  mainAccords?: {
    name?: string | null;
    percentage?: number | null;
    color?: { hex?: string | null } | null;
  }[];
};
