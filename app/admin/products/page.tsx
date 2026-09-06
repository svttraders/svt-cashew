'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminGuard from '@/components/admin-guard';
import { 
  ArrowLeft, Plus, Trash2, Edit3, Sparkles, Upload, 
  Check, X, Eye, Package, AlertTriangle, Tag, RefreshCw, 
  Layers, CheckCircle2, Shield, Search, Flame, SlidersHorizontal, 
  Copy, ImagePlus, ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { Product, INITIAL_PRODUCTS } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

export default function AdminProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RAW' | 'FLAVORED'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal / Drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'images' | 'details'>('general');

  // Form State for editing / creating product
  const [formData, setFormData] = useState<{
    _id?: string;
    title: string;
    slug: string;
    category: 'RAW' | 'FLAVORED';
    grade: string;
    flavor: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    stockQuantity: number;
    lowStockThreshold: number;
    weightOptions: string[];
    images: string[];
    description: string;
    shortDescription: string;
    badgeText: string;
    benefits: string[];
    ingredients: string[];
    isAvailable: boolean;
    isBestseller: boolean;
    isFeatured: boolean;
    newImageUrlInput: string;
    newBenefitInput: string;
    newIngredientInput: string;
  }>({
    title: '',
    slug: '',
    category: 'RAW',
    grade: 'W180',
    flavor: 'Peri Peri',
    price: 900,
    originalPrice: 1050,
    discountPercent: 14,
    stockQuantity: 100,
    lowStockThreshold: 15,
    weightOptions: ['250g', '500g', '1kg'],
    images: ['/images/raw_cashews_hero.webp'],
    description: '',
    shortDescription: '',
    badgeText: 'KING JUMBO',
    benefits: ['Heart Healthy', 'High Protein', 'Zero Cholesterol'],
    ingredients: ['100% Raw Whole Cashews'],
    isAvailable: true,
    isBestseller: false,
    isFeatured: false,
    newImageUrlInput: '',
    newBenefitInput: '',
    newIngredientInput: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err) {
      console.warn('Error fetching products:', err);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setFormData({
      title: '',
      slug: '',
      category: 'RAW',
      grade: 'W180',
      flavor: 'Peri Peri',
      price: 880,
      originalPrice: 990,
      discountPercent: 11,
      stockQuantity: 100,
      lowStockThreshold: 15,
      weightOptions: ['250g', '500g', '1kg'],
      images: ['/images/raw_cashews_hero.webp'],
      description: 'Supreme quality handpicked cashews processed at our Uppal facility.',
      shortDescription: 'Fresh, crunchy premium cashews from Uppal Roastery direct.',
      badgeText: 'NEW HARVEST',
      benefits: ['Zero Cholesterol', 'Rich in Magnesium', 'High Plant Protein'],
      ingredients: ['Whole Cashew Nuts'],
      isAvailable: true,
      isBestseller: false,
      isFeatured: false,
      newImageUrlInput: '',
      newBenefitInput: '',
      newIngredientInput: '',
    });
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProductId(product._id);
    const originalPriceVal = product.originalPrice || Math.round(product.price * 1.15);
    const discountVal = product.discountPercent || (originalPriceVal > product.price ? Math.round(((originalPriceVal - product.price) / originalPriceVal) * 100) : 0);

    setFormData({
      _id: product._id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      grade: product.grade || 'W180',
      flavor: product.flavor || 'Peri Peri',
      price: product.price,
      originalPrice: originalPriceVal,
      discountPercent: discountVal,
      stockQuantity: product.stockQuantity ?? 100,
      lowStockThreshold: product.lowStockThreshold ?? 15,
      weightOptions: product.weightOptions && product.weightOptions.length > 0 ? product.weightOptions : ['250g', '500g', '1kg'],
      images: product.images && product.images.length > 0 ? product.images : ['/images/raw_cashews_hero.webp'],
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      badgeText: product.badgeText || '',
      benefits: product.benefits || ['Heart Healthy', 'High Protein'],
      ingredients: product.ingredients || ['Cashew Nuts'],
      isAvailable: product.isAvailable,
      isBestseller: Boolean(product.isBestseller),
      isFeatured: Boolean(product.isFeatured),
      newImageUrlInput: '',
      newBenefitInput: '',
      newIngredientInput: '',
    });
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  const handleToggleAvailability = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setProducts(prev => prev.map(p => p._id === id ? { ...p, isAvailable: newVal } : p));
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newVal }),
      });
      setStatusMsg(`Product availability updated!`);
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product from the catalog?')) return;
    setProducts(prev => prev.filter(p => p._id !== id));
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setStatusMsg('Product removed from catalog.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({
          ...prev,
          images: [data.url, ...prev.images],
        }));
        setStatusMsg('New image uploaded & added to product gallery!');
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert('Image upload error: ' + (data.error || 'Check Cloudinary credentials'));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!formData.newImageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, prev.newImageUrlInput.trim()],
      newImageUrlInput: '',
    }));
  };

  const handleRemoveImage = (index: number) => {
    if (formData.images.length <= 1) {
      alert('Product must have at least one image.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleSetPrimaryImage = (index: number) => {
    const selected = formData.images[index];
    const rest = formData.images.filter((_, idx) => idx !== index);
    setFormData(prev => ({
      ...prev,
      images: [selected, ...rest],
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: formData.category,
        grade: formData.category === 'RAW' ? formData.grade : undefined,
        flavor: formData.category === 'FLAVORED' ? formData.flavor : undefined,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        discountPercent: Number(formData.discountPercent),
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
        weightOptions: formData.weightOptions,
        images: formData.images,
        description: formData.description,
        shortDescription: formData.shortDescription,
        badgeText: formData.badgeText,
        benefits: formData.benefits,
        ingredients: formData.ingredients,
        isAvailable: formData.isAvailable,
        isBestseller: formData.isBestseller,
        isFeatured: formData.isFeatured,
      };

      if (editingProductId) {
        // Update existing
        const res = await fetch(`/api/products/${editingProductId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMsg(`Product "${formData.title}" updated successfully!`);
          fetchProducts();
          setIsEditorOpen(false);
        } else {
          alert(data.error || 'Failed to update product');
        }
      } else {
        // Create new
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMsg(`New product "${formData.title}" added to catalog!`);
          fetchProducts();
          setIsEditorOpen(false);
        } else {
          alert(data.error || 'Failed to create product');
        }
      }
    } catch (err: any) {
      console.error('Save product error:', err);
      alert(err.message || 'Error saving product');
    } finally {
      setSavingProduct(false);
      setTimeout(() => setStatusMsg(''), 3500);
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.grade && p.grade.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.flavor && p.flavor.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    let matchesStock = true;
    const stock = p.stockQuantity ?? 100;
    const threshold = p.lowStockThreshold ?? 15;
    if (stockFilter === 'IN_STOCK') matchesStock = p.isAvailable && stock > threshold;
    if (stockFilter === 'LOW_STOCK') matchesStock = p.isAvailable && stock > 0 && stock <= threshold;
    if (stockFilter === 'OUT_OF_STOCK') matchesStock = !p.isAvailable || stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalStockKg = products.reduce((sum, p) => sum + (p.stockQuantity || 100), 0);
  const lowStockCount = products.filter(p => (p.stockQuantity ?? 100) <= (p.lowStockThreshold ?? 15)).length;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#141E30] text-slate-100 p-4 sm:p-8 space-y-8">
        
        {/* Top Header & Breadcrumb */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-6">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#D4AF37] hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Dashboard</span>
            </Link>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                Product Catalog Management Suite
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#D4AF37] text-navy-950 uppercase">
                {products.length} Products
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Edit product images, prices, stock quantities, additional discounts, and nutritional specs in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchProducts}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl border border-white/10 flex items-center space-x-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-2.5 gold-pill-button text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Status Toast Alert */}
        {statusMsg && (
          <div className="max-w-7xl mx-auto p-4 bg-[#D4AF37] text-navy-950 font-black text-xs rounded-2xl shadow-xl flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Metric Overview Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="frosted-glass-navy p-4 rounded-2xl border border-[#D4AF37]/30 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Products</span>
            <p className="text-2xl font-black text-white">{products.length}</p>
          </div>

          <div className="frosted-glass-navy p-4 rounded-2xl border border-[#D4AF37]/30 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Inventory</span>
            <p className="text-2xl font-black text-[#D4AF37]">{totalStockKg} kg</p>
          </div>

          <div className="frosted-glass-navy p-4 rounded-2xl border border-[#D4AF37]/30 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Active In Stock</span>
            <p className="text-2xl font-black text-emerald-400">
              {products.filter(p => p.isAvailable).length}
            </p>
          </div>

          <div className="frosted-glass-navy p-4 rounded-2xl border border-[#D4AF37]/30 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Low Stock Alerts</span>
            <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {lowStockCount}
            </p>
          </div>
        </div>

        {/* Search, Category & Stock Filter Bar */}
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 bg-[#0A111E] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center space-x-3 flex-1 min-w-[260px]">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Search by title, grade, or flavour..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D4AF37]/30 bg-[#141E30] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex rounded-xl bg-[#141E30] p-1 border border-[#D4AF37]/30 text-xs">
              {(['ALL', 'RAW', 'FLAVORED'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#D4AF37] text-navy-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#141E30] text-xs font-bold text-[#D4AF37] focus:outline-none"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock (≤15 kg)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Product Catalog Grid / Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const stock = p.stockQuantity ?? 100;
            const threshold = p.lowStockThreshold ?? 15;
            const isLowStock = stock <= threshold;
            const originalPrice = p.originalPrice || Math.round(p.price * 1.15);
            const discount = p.discountPercent || (originalPrice > p.price ? Math.round(((originalPrice - p.price) / originalPrice) * 100) : 0);

            return (
              <div
                key={p._id}
                className="bg-[#0A111E] rounded-3xl border border-[#D4AF37]/30 p-5 space-y-4 shadow-xl hover:border-[#D4AF37] transition-all flex flex-col justify-between group"
              >
                {/* Product Card Top: Image Gallery & Badges */}
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-navy-950">
                    <Image
                      src={p.images[0] || '/images/raw_cashews_hero.webp'}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category & Badge Pills */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        p.category === 'RAW' ? 'bg-emerald-500 text-navy-950' : 'bg-rose-500 text-white'
                      }`}>
                        {p.category} {p.grade ? `(${p.grade})` : ''} {p.flavor ? `(${p.flavor})` : ''}
                      </span>
                      {p.badgeText && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37] text-navy-950 uppercase shadow-md">
                          {p.badgeText}
                        </span>
                      )}
                    </div>

                    {/* Stock Alert Status Overlay */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                        !p.isAvailable
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          : isLowStock
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {!p.isAvailable ? 'Out of Stock' : `${stock} kg in stock`}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold font-heading text-white line-clamp-1">{p.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {p.shortDescription || p.description || 'Premium cashews from Uppal Roastery.'}
                    </p>
                  </div>

                  {/* Price & Discount Tags */}
                  <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-extrabold text-[#D4AF37] font-heading">₹{p.price}</span>
                      {originalPrice > p.price && (
                        <span className="text-xs text-slate-500 line-through">₹{originalPrice}</span>
                      )}
                      {discount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Weight Variants */}
                    <div className="flex items-center space-x-1">
                      {(p.weightOptions || ['500g', '1kg']).map((w) => (
                        <span key={w} className="px-2 py-0.5 bg-navy-900 border border-white/10 rounded text-[9px] font-semibold text-slate-300">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Multi-Image Indicator */}
                  <div className="flex items-center space-x-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">{p.images?.length || 1} Images:</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {p.images?.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="relative w-6 h-6 rounded-full overflow-hidden border border-[#D4AF37]/50">
                          <Image src={img} alt="Thumb" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="pt-4 border-t border-[#D4AF37]/20 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(p._id, p.isAvailable)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                      p.isAvailable
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                        : 'bg-rose-950 text-rose-300 border-rose-500/40 hover:bg-rose-900/60'
                    }`}
                  >
                    {p.isAvailable ? 'In Stock (Active)' : 'Hidden (Disabled)'}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-2 bg-[#D4AF37] text-navy-950 rounded-xl hover:brightness-110 transition-all font-bold text-xs flex items-center space-x-1 shadow-md"
                      title="Edit Product Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      className="p-2 bg-rose-950/80 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-900 transition-all"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL / DRAWER PRODUCT EDITOR */}
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-[#0A111E] text-slate-100 w-full max-w-4xl rounded-3xl border border-[#D4AF37]/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-[#D4AF37]/30 flex items-center justify-between bg-navy-950">
                <div>
                  <h2 className="text-xl font-bold font-heading text-[#D4AF37] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    <span>{editingProductId ? 'Edit Product Catalog Details' : 'Add New Product to Catalog'}</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Set images, prices, stock quantities, additional discounts, and nutritional profile.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs inside Editor */}
              <div className="flex border-b border-[#D4AF37]/20 bg-[#141E30] px-5 gap-4 text-xs font-bold">
                {[
                  { id: 'general', label: '1. General Info & Badges' },
                  { id: 'pricing', label: '2. Pricing & Stock Inventory' },
                  { id: 'images', label: `3. Image Gallery (${formData.images.length})` },
                  { id: 'details', label: '4. Highlights & Specs' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`py-3 border-b-2 transition-colors ${
                      activeTab === t.id
                        ? 'border-[#D4AF37] text-[#D4AF37]'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSaveProduct} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                
                {/* TAB 1: GENERAL INFO */}
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-slate-300 block mb-1">Product Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. W180 King Jumbo Raw Cashews (1kg)"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Category *</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs font-bold text-[#D4AF37] focus:outline-none"
                        >
                          <option value="RAW">RAW CASHEWS (Natural Whole)</option>
                          <option value="FLAVORED">FLAVOURED CASHEWS (Roasted & Spiced)</option>
                        </select>
                      </div>

                      {formData.category === 'RAW' ? (
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">Cashew Grade Specification</label>
                          <input
                            type="text"
                            placeholder="e.g. W180, W210, W240, W320, Splits"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">Signature Flavour Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Peri Peri, Tandoori Masala, Pudina, Salted"
                            value={formData.flavor}
                            onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Promotional Badge Tag</label>
                        <input
                          type="text"
                          placeholder="e.g. KING JUMBO, BESTSELLER, 20% OFF, LIMITED BATCH"
                          value={formData.badgeText}
                          onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Product URL Slug</label>
                        <input
                          type="text"
                          placeholder="w180-jumbo-cashew"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-slate-300 block mb-1">Short Description (Card Summary)</label>
                        <input
                          type="text"
                          placeholder="Brief 1-liner summary shown on shop cards..."
                          value={formData.shortDescription}
                          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-slate-300 block mb-1">Full Detailed Description</label>
                        <textarea
                          rows={3}
                          placeholder="Describe the processing, origin, roasting technique and taste notes..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PRICING & INVENTORY */}
                {activeTab === 'pricing' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-2xl bg-[#141E30] border border-[#D4AF37]/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-[#D4AF37] block mb-1">Selling Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => {
                            const newPrice = Number(e.target.value);
                            const orig = formData.originalPrice;
                            const disc = orig > newPrice ? Math.round(((orig - newPrice) / orig) * 100) : 0;
                            setFormData({ ...formData, price: newPrice, discountPercent: disc });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-base font-extrabold focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Original MRP Price (₹)</label>
                        <input
                          type="number"
                          value={formData.originalPrice}
                          onChange={(e) => {
                            const newOrig = Number(e.target.value);
                            const p = formData.price;
                            const disc = newOrig > p ? Math.round(((newOrig - p) / newOrig) * 100) : 0;
                            setFormData({ ...formData, originalPrice: newOrig, discountPercent: disc });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-base font-extrabold focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-emerald-400 block mb-1">Calculated Discount (%)</label>
                        <input
                          type="number"
                          value={formData.discountPercent}
                          onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-navy-950 text-emerald-300 text-base font-extrabold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141E30] border border-[#D4AF37]/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Stock Quantity (kg or units) *</label>
                        <input
                          type="number"
                          required
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-sm font-bold focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Low Stock Warning Threshold (kg)</label>
                        <input
                          type="number"
                          value={formData.lowStockThreshold}
                          onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-sm font-bold focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-2">Available Packaging Weights</label>
                      <div className="flex flex-wrap gap-2">
                        {['250g', '500g', '1kg', '2kg', '5kg Wholesale'].map((weight) => {
                          const isSelected = formData.weightOptions.includes(weight);
                          return (
                            <button
                              key={weight}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  weightOptions: isSelected
                                    ? prev.weightOptions.filter(w => w !== weight)
                                    : [...prev.weightOptions, weight],
                                }));
                              }}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                isSelected
                                  ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37]'
                                  : 'bg-navy-950 text-slate-400 border-white/10 hover:border-white/20'
                              }`}
                            >
                              {weight} {isSelected ? '✓' : '+'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: IMAGE GALLERY & CLOUDINARY UPLOAD */}
                {activeTab === 'images' && (
                  <div className="space-y-6">
                    {/* Cloudinary Upload & URL Adder */}
                    <div className="p-4 rounded-2xl bg-[#141E30] border border-[#D4AF37]/30 space-y-3">
                      <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                        <ImagePlus className="w-4 h-4" />
                        <span>Upload or Add Product Images</span>
                      </h4>

                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <label className="w-full sm:w-auto px-5 py-2.5 bg-[#D4AF37] hover:brightness-110 text-navy-950 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-2 shrink-0 shadow-md">
                          <Upload className="w-4 h-4" />
                          <span>{uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Image File'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>

                        <div className="flex items-center space-x-2 w-full">
                          <input
                            type="text"
                            placeholder="Or paste direct image URL (e.g. /images/... or https://...)"
                            value={formData.newImageUrlInput}
                            onChange={(e) => setFormData({ ...formData, newImageUrlInput: e.target.value })}
                            className="flex-1 px-3.5 py-2 rounded-xl border border-white/10 bg-navy-950 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-bold rounded-xl border border-white/10 shrink-0"
                          >
                            Add URL
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Image Cards Grid */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">
                        Current Image Gallery (Click &quot;Primary&quot; to set first display image)
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {formData.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`relative rounded-2xl overflow-hidden border p-1 bg-navy-950 group space-y-2 ${
                              idx === 0 ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30' : 'border-white/10'
                            }`}
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden">
                              <Image src={imgUrl} alt={`Product ${idx}`} fill className="object-cover" />
                              {idx === 0 && (
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#D4AF37] text-navy-950 text-[10px] font-black uppercase">
                                  Primary
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between px-1 pb-1">
                              {idx !== 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="text-[10px] text-[#D4AF37] hover:underline font-bold"
                                >
                                  Set Primary
                                </button>
                              ) : (
                                <span className="text-[10px] text-[#D4AF37] font-bold">Primary View</span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: HIGHLIGHTS & SPECS */}
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    {/* Health Benefits List */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Health Benefits & Key Selling Points</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {formData.benefits.map((b, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#141E30] border border-white/10 text-xs text-[#D4AF37] flex items-center space-x-1">
                            <span>{b}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== idx) })}
                              className="text-slate-400 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. Rich in Antioxidants, Oil-Free Roasted"
                          value={formData.newBenefitInput}
                          onChange={(e) => setFormData({ ...formData, newBenefitInput: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-navy-950 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!formData.newBenefitInput.trim()) return;
                            setFormData({ ...formData, benefits: [...formData.benefits, formData.newBenefitInput.trim()], newBenefitInput: '' });
                          }}
                          className="px-4 py-2 bg-white/10 text-[#D4AF37] text-xs font-bold rounded-xl"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Ingredients List</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {formData.ingredients.map((ing, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#141E30] border border-white/10 text-xs text-slate-200 flex items-center space-x-1">
                            <span>{ing}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, ingredients: formData.ingredients.filter((_, i) => i !== idx) })}
                              className="text-slate-400 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. Whole Raw Cashews, Himalayan Rock Salt"
                          value={formData.newIngredientInput}
                          onChange={(e) => setFormData({ ...formData, newIngredientInput: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-navy-950 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!formData.newIngredientInput.trim()) return;
                            setFormData({ ...formData, ingredients: [...formData.ingredients, formData.newIngredientInput.trim()], newIngredientInput: '' });
                          }}
                          className="px-4 py-2 bg-white/10 text-[#D4AF37] text-xs font-bold rounded-xl"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-[#D4AF37]/30 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="px-8 py-3 gold-pill-button text-xs font-black uppercase tracking-wider shadow-xl flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingProduct ? 'Saving to Database...' : editingProductId ? 'Update Product' : 'Publish Product'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
