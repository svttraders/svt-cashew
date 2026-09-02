'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INITIAL_PRODUCTS, Product } from '@/lib/mock-data';
import { ArrowLeft, Plus, Check, Trash2, Edit3, Sparkles } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'RAW' | 'FLAVORED'>('FLAVORED');
  const [newPrice, setNewPrice] = useState('880');
  const [newFlavor, setNewFlavor] = useState('Peri Peri');
  const [newGrade, setNewGrade] = useState('W180');
  const [newDescription, setNewDescription] = useState('');

  const handleToggleAvailable = (id: string) => {
    setProducts(prev => prev.map(p => p._id === id ? { ...p, isAvailable: !p.isAvailable } : p));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Product = {
      _id: `prod-${Date.now()}`,
      title: newTitle || 'Special Gourmet Cashews',
      slug: (newTitle || 'gourmet-cashew').toLowerCase().replace(/ /g, '-'),
      category: newCategory,
      price: Number(newPrice) || 880,
      flavor: newCategory === 'FLAVORED' ? newFlavor : undefined,
      grade: newCategory === 'RAW' ? newGrade : undefined,
      weightOptions: ['500g', '1kg'],
      images: ['https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80'],
      description: newDescription || 'Premium SVT cashews roasted in Uppal.',
      isAvailable: true,
      rating: 5.0,
      reviewsCount: 1
    };

    setProducts([created, ...products]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-amber-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-black font-display text-slate-900">
            Product Catalog Manager
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md hover:from-amber-400 hover:to-amber-500 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category / Spec</th>
                <th className="py-3 px-4">Base Price (500g)</th>
                <th className="py-3 px-4">Sizes Available</th>
                <th className="py-3 px-4">Stock Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-amber-50/20">
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {p.title}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      p.category === 'RAW' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.category} ({p.grade || p.flavor})
                    </span>
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900 text-sm">
                    ₹{p.price}
                  </td>
                  <td className="py-4 px-4 space-x-1">
                    {p.weightOptions.map(w => (
                      <span key={w} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                        {w}
                      </span>
                    ))}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleAvailable(p._id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        p.isAvailable
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {p.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-display text-slate-900">Add New Cashew Product</h3>
            
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schezwan Roasted Cashews"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  >
                    <option value="FLAVORED">FLAVORED</option>
                    <option value="RAW">RAW</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Freshly roasted cashews..."
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
