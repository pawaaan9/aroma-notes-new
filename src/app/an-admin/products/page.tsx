"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, getDocs, deleteDoc, doc, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { formatLkr } from "@/utils/currency";

type Tab = "all" | "originals" | "inspired";

type FirestoreProduct = {
  id: string;
  name: string;
  brand: string | null;
  gender: string | null;
  perfumeType: string | null;
  coverImageUrl: string | null;
  variants: {
    size: string;
    price: number | null;
    discountPrice: number | null;
    inStock: boolean;
    photoUrl: string | null;
  }[];
};

type Variant = {
  size: string;
  price: number | "";
  discountPrice: number | "";
  inStock: boolean;
  photoFile: File | null;
  photoPreview: string;
};

export default function ProductsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<FirestoreProduct | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All Products" },
    { key: "originals", label: "Originals" },
    { key: "inspired", label: "Inspired" },
  ];

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items: FirestoreProduct[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FirestoreProduct[];
      setProducts(items);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(productId);
    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchesTab = activeTab === "all" || p.perfumeType === activeTab;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStockStatus = (p: FirestoreProduct) => {
    const variants = p.variants || [];
    if (variants.length === 0) return "no-variants";
    const inStockCount = variants.filter((v) => v.inStock).length;
    if (inStockCount === variants.length) return "in-stock";
    if (inStockCount > 0) return "partial";
    return "out-of-stock";
  };

  const handleProductAdded = () => {
    setShowModal(false);
    setLoading(true);
    fetchProducts();
  };

  return (
    <div className="min-h-screen p-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 p-6 shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-saira">Products</h1>
            <p className="text-sm text-white/70 font-saira">Manage your perfume catalog</p>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Action Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:shadow-xl font-saira"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-gray-800/60 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all font-saira ${
                activeTab === tab.key
                  ? "bg-white/10 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-gray-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira sm:w-64"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-gray-800/50 px-6 py-16 text-center backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-700/50">
                <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400 font-saira">
                {products.length === 0 ? "No products yet" : "No matching products"}
              </p>
              <p className="mt-1 text-xs text-gray-500 font-saira">
                {products.length === 0
                  ? "Add your first product to get started"
                  : "Try adjusting your search or filter"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-white/10 bg-gray-800/50 backdrop-blur-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">Brand</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">100ml Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">10ml Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">Stock</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((product) => {
                    const stock = getStockStatus(product);
                    return (
                      <tr key={product.id} className="transition-colors hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-700 cursor-pointer ring-2 ring-transparent transition-all hover:ring-amber-500/50"
                              onClick={() => setPreviewProduct(product)}
                              title="Preview product"
                            >
                              {product.coverImageUrl ? (
                                <Image src={product.coverImageUrl} alt={product.name} width={40} height={40} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white font-saira">{product.name}</p>
                              <p className="text-xs text-gray-500 font-saira">
                                {(product.variants || []).length} variant{(product.variants || []).length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300 font-saira">{product.brand || "—"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium font-saira ${product.perfumeType === "originals" ? "bg-amber-500/20 text-amber-400" : "bg-violet-500/20 text-violet-400"}`}>
                            {product.perfumeType === "originals" ? "Original" : "Inspired"}
                          </span>
                        </td>
                        {(() => {
                          const v100 = (product.variants || []).find((v) => v.size?.toLowerCase().includes("100ml"));
                          const v10 = (product.variants || []).find((v) => v.size?.toLowerCase().includes("10ml"));
                          return (
                            <>
                              <td className="px-6 py-4">
                                {v100 ? (
                                  <div className="font-saira">
                                    {v100.discountPrice != null && v100.price != null && v100.discountPrice < v100.price ? (
                                      <>
                                        <p className="text-xs text-gray-500 line-through">LKR {v100.price.toLocaleString()}</p>
                                        <p className="text-sm font-medium text-emerald-400">LKR {v100.discountPrice.toLocaleString()}</p>
                                      </>
                                    ) : v100.price != null ? (
                                      <p className="text-sm text-white font-medium">LKR {v100.price.toLocaleString()}</p>
                                    ) : (
                                      <p className="text-sm text-gray-500">—</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 font-saira">—</p>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {v10 ? (
                                  <div className="font-saira">
                                    {v10.discountPrice != null && v10.price != null && v10.discountPrice < v10.price ? (
                                      <>
                                        <p className="text-xs text-gray-500 line-through">LKR {v10.price.toLocaleString()}</p>
                                        <p className="text-sm font-medium text-emerald-400">LKR {v10.discountPrice.toLocaleString()}</p>
                                      </>
                                    ) : v10.price != null ? (
                                      <p className="text-sm text-white font-medium">LKR {v10.price.toLocaleString()}</p>
                                    ) : (
                                      <p className="text-sm text-gray-500">—</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 font-saira">—</p>
                                )}
                              </td>
                            </>
                          );
                        })()}
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium font-saira ${stock === "in-stock" ? "bg-emerald-500/20 text-emerald-400" : stock === "partial" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                            {stock === "in-stock" ? "In Stock" : stock === "partial" ? "Partial" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setPreviewProduct(product)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-amber-500/10 hover:text-amber-400" title="Preview">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={() => router.push(`/an-admin/products/edit/${product.id}`)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white" title="Edit">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50" title="Delete">
                              {deleting === product.id ? (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 lg:hidden">
              {filtered.map((product) => {
                const stock = getStockStatus(product);
                return (
                  <div key={product.id} className="rounded-xl border border-white/10 bg-gray-800/50 p-4 backdrop-blur-sm">
                    {/* Top: image + name + actions */}
                    <div className="flex items-start gap-3">
                      <div
                        className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-700 cursor-pointer"
                        onClick={() => setPreviewProduct(product)}
                      >
                        {product.coverImageUrl ? (
                          <Image src={product.coverImageUrl} alt={product.name} width={56} height={56} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white font-saira truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 font-saira">{product.brand || "No brand"}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium font-saira ${product.perfumeType === "originals" ? "bg-amber-500/20 text-amber-400" : "bg-violet-500/20 text-violet-400"}`}>
                            {product.perfumeType === "originals" ? "Original" : "Inspired"}
                          </span>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium font-saira ${stock === "in-stock" ? "bg-emerald-500/20 text-emerald-400" : stock === "partial" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                            {stock === "in-stock" ? "In Stock" : stock === "partial" ? "Partial" : "Out"}
                          </span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setPreviewProduct(product)} className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-500/10 hover:text-amber-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50">
                          {deleting === product.id ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    {/* Prices: 100ml and 10ml side by side */}
                    {(() => {
                      const v100 = (product.variants || []).find((v) => v.size?.toLowerCase().includes("100ml"));
                      const v10 = (product.variants || []).find((v) => v.size?.toLowerCase().includes("10ml"));
                      return (
                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/5 pt-3 font-saira">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">100ml</p>
                            {v100 ? (
                              v100.discountPrice != null && v100.price != null && v100.discountPrice < v100.price ? (
                                <>
                                  <p className="text-[11px] text-gray-600 line-through">LKR {v100.price.toLocaleString()}</p>
                                  <p className="text-xs font-semibold text-emerald-400">LKR {v100.discountPrice.toLocaleString()}</p>
                                </>
                              ) : v100.price != null ? (
                                <p className="text-xs font-medium text-white">LKR {v100.price.toLocaleString()}</p>
                              ) : (
                                <p className="text-xs text-gray-600">—</p>
                              )
                            ) : (
                              <p className="text-xs text-gray-600">—</p>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">10ml</p>
                            {v10 ? (
                              v10.discountPrice != null && v10.price != null && v10.discountPrice < v10.price ? (
                                <>
                                  <p className="text-[11px] text-gray-600 line-through">LKR {v10.price.toLocaleString()}</p>
                                  <p className="text-xs font-semibold text-emerald-400">LKR {v10.discountPrice.toLocaleString()}</p>
                                </>
                              ) : v10.price != null ? (
                                <p className="text-xs font-medium text-white">LKR {v10.price.toLocaleString()}</p>
                              ) : (
                                <p className="text-xs text-gray-600">—</p>
                              )
                            ) : (
                              <p className="text-xs text-gray-600">—</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onSuccess={handleProductAdded}
        />
      )}

      {/* Product Preview Sidebar */}
      {previewProduct && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setPreviewProduct(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-gray-900 border-l border-white/10 shadow-2xl animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h3 className="text-sm font-semibold text-white font-saira">Customer Preview</h3>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product Card Preview */}
            <div className="p-5">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-500 font-saira">Card View</p>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100 relative">
                  {previewProduct.brand && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 rounded bg-gray-900/90 text-white text-[7px] tracking-normal uppercase shadow whitespace-nowrap">
                      {previewProduct.brand}
                    </div>
                  )}
                  {previewProduct.coverImageUrl ? (
                    <Image
                      src={previewProduct.coverImageUrl}
                      alt={previewProduct.name}
                      width={400}
                      height={500}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-gray-900 font-saira line-clamp-1">{previewProduct.name}</h4>
                  {(() => {
                    const target =
                      (previewProduct.variants || []).find((v) => v.size?.toLowerCase().includes("100ml")) ??
                      (previewProduct.variants || [])[0] ??
                      null;
                    if (!target) return null;
                    const hasDiscount = target.discountPrice != null && target.price != null && target.discountPrice < target.price;
                    return (
                      <div className="mt-1 flex items-center gap-2">
                        {hasDiscount && target.price != null && (
                          <span className="text-xs line-through text-gray-400 font-saira">{formatLkr(target.price)}</span>
                        )}
                        <span className="text-sm font-bold text-amber-600 font-saira">
                          {formatLkr(hasDiscount ? target.discountPrice! : target.price!)}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Variant Details */}
            <div className="px-5 pb-5">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-500 font-saira">Variants</p>
              <div className="space-y-2">
                {(previewProduct.variants || []).map((v, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    {v.photoUrl ? (
                      <Image src={v.photoUrl} alt={v.size || ""} width={40} height={40} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-700">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white font-saira">{v.size || "—"}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${v.inStock ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {v.inStock ? "In Stock" : "Out"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {v.discountPrice != null && v.price != null && v.discountPrice < v.price ? (
                          <>
                            <span className="text-xs text-gray-500 line-through font-saira">{formatLkr(v.price)}</span>
                            <span className="text-xs font-semibold text-emerald-400 font-saira">{formatLkr(v.discountPrice)}</span>
                          </>
                        ) : v.price != null ? (
                          <span className="text-xs text-gray-300 font-saira">{formatLkr(v.price)}</span>
                        ) : (
                          <span className="text-xs text-gray-500 font-saira">No price</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="px-5 pb-5">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-500 font-saira">Details</p>
              <div className="space-y-2 text-sm font-saira">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gender</span>
                  <span className="capitalize text-gray-300">{previewProduct.gender || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="capitalize text-gray-300">{previewProduct.perfumeType || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Variants</span>
                  <span className="text-gray-300">{(previewProduct.variants || []).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Add Product Modal ─────────────────────── */

function AddProductModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unisex">("unisex");
  const [perfumeType, setPerfumeType] = useState<"originals" | "inspired">("originals");
  const [description, setDescription] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [variants, setVariants] = useState<Variant[]>([
    { size: "", price: "", discountPrice: "", inStock: true, photoFile: null, photoPreview: "" },
  ]);

  const [accords, setAccords] = useState<{ name: string; percentage: number | ""; color: string }[]>([]);

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
          i === idx ? { ...v, photoFile: file, photoPreview: URL.createObjectURL(file) } : v
        )
      );
    }
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: "", price: "", discountPrice: "", inStock: true, photoFile: null, photoPreview: "" },
    ]);
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: keyof Variant, value: unknown) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  const addAccord = () => {
    setAccords((prev) => [...prev, { name: "", percentage: "", color: "#d97706" }]);
  };

  const removeAccord = (idx: number) => {
    setAccords((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateAccord = (idx: number, field: string, value: unknown) => {
    setAccords((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Product name is required"); return; }
    if (!coverFile) { setError("Cover image is required"); return; }
    if (variants.length === 0) { setError("At least one variant is required"); return; }

    setSaving(true);
    setError("");

    try {
      const timestamp = Date.now();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const coverUrl = await uploadImage(coverFile, `products/${slug}/cover-${timestamp}`);

      const variantData = await Promise.all(
        variants.map(async (v, idx) => {
          let photoUrl = "";
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
        })
      );

      const accordsData = accords
        .filter((a) => a.name.trim())
        .map((a) => ({
          name: a.name,
          percentage: a.percentage === "" ? null : Number(a.percentage),
          color: { hex: a.color },
        }));

      await addDoc(collection(db, "products"), {
        name: name.trim(),
        slug: { current: slug },
        brand: brand.trim() || null,
        gender,
        perfumeType,
        descriptionText: description.trim() || null,
        coverImageUrl: coverUrl,
        variants: variantData,
        mainAccords: accordsData.length > 0 ? accordsData : null,
        createdAt: serverTimestamp(),
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative flex w-full max-w-2xl max-h-[80vh] flex-col rounded-2xl border border-white/10 bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white font-saira">Add New Product</h2>
            <p className="text-xs text-gray-400 font-saira">Fill in the product details</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-saira">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-white font-saira mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400 font-saira">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Allure Homme Sport"
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400 font-saira">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Chanel"
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400 font-saira">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female" | "unisex")}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat py-2 pl-3 pr-9 text-sm text-white outline-none focus:border-amber-500/50 font-saira [&>option]:bg-gray-800"
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
                  className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat py-2 pl-3 pr-9 text-sm text-white outline-none focus:border-amber-500/50 font-saira [&>option]:bg-gray-800"
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
                  placeholder="Describe the fragrance notes, character, etc."
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira resize-none"
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <h3 className="text-sm font-semibold text-white font-saira mb-1">
              Cover Image <span className="text-red-400">*</span>
            </h3>
            <p className="text-[11px] text-gray-500 font-saira mb-3">
              This image appears on the product card in the catalog
            </p>
            <div className="flex items-center gap-4">
              <div
                onClick={() => coverInputRef.current?.click()}
                className="group flex h-24 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-white/20 bg-white/5 transition-all hover:border-amber-500/50 hover:bg-white/10"
              >
                {coverPreview ? (
                  <Image src={coverPreview} alt="Cover" width={80} height={96} className="h-full w-full object-cover" />
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
              {coverFile && <p className="text-xs text-amber-400 font-saira">{coverFile.name}</p>}
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white font-saira">
                  Variants <span className="text-red-400">*</span>
                </h3>
                <p className="text-[11px] text-gray-500 font-saira mt-0.5">
                  Each size has its own photo, price &amp; stock
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-amber-400 font-saira">Variant {idx + 1}</span>
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-300">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
                        className="w-full appearance-none rounded-lg border border-white/10 bg-gray-800/60 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-[length:14px] bg-[right_10px_center] bg-no-repeat py-1.5 pl-2.5 pr-8 text-sm text-white outline-none focus:border-amber-500/50 font-saira [&>option]:bg-gray-800"
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
                        className="w-full rounded-lg border border-white/10 bg-gray-800/60 py-1.5 px-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
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
                        className="w-full rounded-lg border border-white/10 bg-gray-800/60 py-1.5 px-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[11px] text-gray-500 font-saira">Stock</label>
                      <button
                        type="button"
                        onClick={() => updateVariant(idx, "inStock", !variant.inStock)}
                        className={`w-full rounded-lg py-1.5 px-2.5 text-xs font-medium transition-all font-saira ${
                          variant.inStock
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {variant.inStock ? "In Stock" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                  {/* Variant Photo */}
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
                    <p className="text-[11px] text-gray-500 font-saira">Photo for this variant</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Accords */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white font-saira">Main Accords</h3>
                <p className="text-[11px] text-gray-500 font-saira mt-0.5">Optional</p>
              </div>
              <button
                type="button"
                onClick={addAccord}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira"
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
                      className="flex-1 rounded-lg border border-white/10 bg-gray-800/60 py-1.5 px-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={accord.percentage}
                      onChange={(e) => updateAccord(idx, "percentage", e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="%"
                      className="w-16 rounded-lg border border-white/10 bg-gray-800/60 py-1.5 px-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
        </form>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed font-saira"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
