"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

type Variant = {
  size: string;
  price: number | "";
  discountPrice: number | "";
  inStock: boolean;
  photoFile: File | null;
  photoPreview: string;
  existingPhotoUrl: string;
};

type Accord = {
  name: string;
  percentage: number | "";
  color: string;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unisex">("unisex");
  const [perfumeType, setPerfumeType] = useState<"originals" | "inspired">("originals");
  const [description, setDescription] = useState("");

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [existingCoverUrl, setExistingCoverUrl] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Variants
  const [variants, setVariants] = useState<Variant[]>([]);

  // Accords
  const [accords, setAccords] = useState<Accord[]>([]);

  // Load product data
  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "products", productId));
        if (!snap.exists()) {
          setError("Product not found");
          setLoading(false);
          return;
        }
        const data = snap.data();
        setName(data.name ?? "");
        setBrand(data.brand ?? "");
        setGender(data.gender ?? "unisex");
        setPerfumeType(data.perfumeType ?? "originals");
        setDescription(data.descriptionText ?? "");
        setExistingCoverUrl(data.coverImageUrl ?? "");
        setCoverPreview(data.coverImageUrl ?? "");

        // Variants
        const rawVariants = (data.variants ?? []) as {
          size?: string;
          price?: number | null;
          discountPrice?: number | null;
          inStock?: boolean;
          photoUrl?: string | null;
        }[];
        setVariants(
          rawVariants.map((v) => ({
            size: v.size ?? "",
            price: v.price ?? "",
            discountPrice: v.discountPrice ?? "",
            inStock: v.inStock ?? true,
            photoFile: null,
            photoPreview: v.photoUrl ?? "",
            existingPhotoUrl: v.photoUrl ?? "",
          })),
        );

        // Accords
        const rawAccords = (data.mainAccords ?? []) as {
          name?: string;
          percentage?: number | null;
          color?: { hex?: string | null } | null;
        }[];
        setAccords(
          rawAccords.map((a) => ({
            name: a.name ?? "",
            percentage: a.percentage ?? "",
            color: a.color?.hex ?? "#d97706",
          })),
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // Handlers
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleVariantPhotoChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVariants((prev) =>
        prev.map((v, i) =>
          i === idx ? { ...v, photoFile: file, photoPreview: URL.createObjectURL(file) } : v,
        ),
      );
    }
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: "", price: "", discountPrice: "", inStock: true, photoFile: null, photoPreview: "", existingPhotoUrl: "" },
    ]);
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: keyof Variant, value: unknown) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const addAccord = () => {
    setAccords((prev) => [...prev, { name: "", percentage: "", color: "#d97706" }]);
  };

  const removeAccord = (idx: number) => {
    setAccords((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateAccord = (idx: number, field: string, value: unknown) => {
    setAccords((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (variants.length === 0) {
      setError("At least one variant is required");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const timestamp = Date.now();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // Upload new cover if changed
      let coverUrl = existingCoverUrl;
      if (coverFile) {
        coverUrl = await uploadImage(coverFile, `products/${slug}/cover-${timestamp}`);
      }

      // Process variants
      const variantData = await Promise.all(
        variants.map(async (v, idx) => {
          let photoUrl = v.existingPhotoUrl;
          if (v.photoFile) {
            photoUrl = await uploadImage(v.photoFile, `products/${slug}/variant-${idx}-${timestamp}`);
          }
          return {
            size: v.size,
            price: v.price === "" ? null : Number(v.price),
            discountPrice: v.discountPrice === "" ? null : Number(v.discountPrice),
            inStock: v.inStock,
            photoUrl: photoUrl || null,
          };
        }),
      );

      const accordsData = accords
        .filter((a) => a.name.trim())
        .map((a) => ({
          name: a.name,
          percentage: a.percentage === "" ? null : Number(a.percentage),
          color: { hex: a.color },
        }));

      await updateDoc(doc(db, "products", productId), {
        name: name.trim(),
        slug: { current: slug },
        brand: brand.trim() || null,
        gender,
        perfumeType,
        descriptionText: description.trim() || null,
        coverImageUrl: coverUrl,
        variants: variantData,
        mainAccords: accordsData.length > 0 ? accordsData : null,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm text-gray-400 font-saira">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400 font-saira">{error}</p>
          <button
            onClick={() => router.push("/an-admin/products")}
            className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm text-white font-saira hover:bg-white/20"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/an-admin/products")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-white font-saira">Edit Product</h1>
          <p className="text-sm text-gray-400 font-saira">Update product details</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-saira">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400 font-saira">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Product updated successfully!
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-white font-saira mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400 font-saira">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400 font-saira">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400 font-saira">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female" | "unisex")}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-white outline-none focus:border-amber-500/50 font-saira [&>option]:bg-gray-800"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400 font-saira">Perfume Type</label>
              <select
                value={perfumeType}
                onChange={(e) => setPerfumeType(e.target.value as "originals" | "inspired")}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-white outline-none focus:border-amber-500/50 font-saira [&>option]:bg-gray-800"
              >
                <option value="originals">Originals</option>
                <option value="inspired">Inspired</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-400 font-saira">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira resize-none"
              />
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-white font-saira mb-1">Cover Image</h2>
          <p className="text-[11px] text-gray-500 font-saira mb-4">Click to change the cover image</p>
          <div className="flex items-center gap-4">
            <div
              onClick={() => coverInputRef.current?.click()}
              className="group flex h-28 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-white/20 bg-white/5 transition-all hover:border-amber-500/50 hover:bg-white/10"
            >
              {coverPreview ? (
                <Image src={coverPreview} alt="Cover" width={96} height={112} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-gray-300">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-saira">Upload</span>
                </div>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            {coverFile && <p className="text-xs text-amber-400 font-saira">{coverFile.name} (new)</p>}
          </div>
        </div>

        {/* Variants */}
        <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white font-saira">Variants</h2>
              <p className="text-[11px] text-gray-500 font-saira mt-0.5">Each size with its own photo, price &amp; stock</p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-gray-500 font-saira">No variants. Add at least one.</p>
          ) : (
            <div className="space-y-3">
              {variants.map((variant, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-amber-400 font-saira">Variant {idx + 1}</span>
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-300">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <div>
                      <label className="mb-0.5 block text-[11px] text-gray-500 font-saira">Size</label>
                      <select
                        value={variant.size}
                        onChange={(e) => updateVariant(idx, "size", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-gray-800/60 py-2 px-2.5 text-sm text-white outline-none focus:border-amber-500/50 font-saira [&>option]:bg-gray-800"
                      >
                        <option value="">Select size</option>
                        <option value="100ml">100ml</option>
                        <option value="50ml">50ml</option>
                        <option value="10ml (decant)">10ml (decant)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[11px] text-gray-500 font-saira">Price (LKR)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={variant.price === "" || variant.price == null ? "" : Number(variant.price).toLocaleString("en-US")}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (raw === "") { updateVariant(idx, "price", ""); return; }
                          if (/^\d+$/.test(raw)) updateVariant(idx, "price", Number(raw));
                        }}
                        placeholder="0"
                        className="w-full rounded-lg border border-white/10 bg-gray-800/60 py-2 px-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[11px] text-gray-500 font-saira">Discount (LKR)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={variant.discountPrice === "" || variant.discountPrice == null ? "" : Number(variant.discountPrice).toLocaleString("en-US")}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (raw === "") { updateVariant(idx, "discountPrice", ""); return; }
                          if (/^\d+$/.test(raw)) updateVariant(idx, "discountPrice", Number(raw));
                        }}
                        placeholder="Optional"
                        className="w-full rounded-lg border border-white/10 bg-gray-800/60 py-2 px-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[11px] text-gray-500 font-saira">Stock</label>
                      <button
                        type="button"
                        onClick={() => updateVariant(idx, "inStock", !variant.inStock)}
                        className={`w-full rounded-lg py-2 px-2.5 text-xs font-medium transition-all font-saira ${
                          variant.inStock
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {variant.inStock ? "In Stock" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                  {/* Variant photo */}
                  <div className="mt-3 flex items-center gap-3">
                    <label className="group flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-white/20 bg-gray-800/60 transition-all hover:border-amber-500/50">
                      {variant.photoPreview ? (
                        <Image src={variant.photoPreview} alt={`V${idx + 1}`} width={56} height={56} className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleVariantPhotoChange(idx, e)} className="hidden" />
                    </label>
                    <p className="text-[11px] text-gray-500 font-saira">
                      {variant.photoFile ? `${variant.photoFile.name} (new)` : variant.existingPhotoUrl ? "Current photo (click to change)" : "Photo for this variant"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Accords */}
        <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white font-saira">Main Accords</h2>
              <p className="text-[11px] text-gray-500 font-saira mt-0.5">Optional fragrance notes</p>
            </div>
            <button
              type="button"
              onClick={addAccord}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Accord
            </button>
          </div>
          {accords.length === 0 ? (
            <p className="text-xs text-gray-500 font-saira">No accords added.</p>
          ) : (
            <div className="space-y-2">
              {accords.map((accord, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accord.color}
                    onChange={(e) => updateAccord(idx, "color", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border border-white/10 bg-transparent"
                  />
                  <input
                    type="text"
                    value={accord.name}
                    onChange={(e) => updateAccord(idx, "name", e.target.value)}
                    placeholder="e.g. Woody"
                    className="flex-1 rounded-lg border border-white/10 bg-gray-800/60 py-2 px-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={accord.percentage}
                    onChange={(e) => updateAccord(idx, "percentage", e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="%"
                    className="w-16 rounded-lg border border-white/10 bg-gray-800/60 py-2 px-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button type="button" onClick={() => removeAccord(idx)} className="text-red-400 hover:text-red-300">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => router.push("/an-admin/products")}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed font-saira"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
