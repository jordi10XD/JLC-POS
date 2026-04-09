"use client";

import { useState } from "react";
import { ProductForm } from "@/components/inventario/ProductForm";
import { Plus, Edit2, AlertTriangle, PackageSearch } from "lucide-react";

interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precio_venta: number;
  precio_minimo: number;
  precio_compra?: number;
  stock_actual: number;
  stock_minimo: number;
}

export function InventoryClient({ 
  initialProducts, 
  userRole, 
  categories 
}: { 
  initialProducts: Product[], 
  userRole: "admin" | "vendedor",
  categories: string[]
}) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredProducts = initialProducts.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "ALL" || p.categoria === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col cyber-panel p-6 rounded-lg opacity-90 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#00f2fe]/20 pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-mono cyber-glow-cyan text-[#00f2fe] flex items-center gap-2">
            <PackageSearch className="w-6 h-6" /> GLOBAL_INVENTORY
          </h1>
          <p className="font-mono text-sm text-[#00f2fe]/60 mt-1">Gestión de almacén y variantes.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <input 
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cyber-input px-3 py-2 rounded text-sm w-full md:w-64"
          />
          <select 
            className="cyber-input px-3 py-2 rounded text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">TODAS LAS CATEGORÍAS</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
          </select>

          <button 
            onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
            className="cyber-button flex items-center justify-center gap-2 px-4 py-2 rounded whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> CREAR
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded lg:border border-[#00f2fe]/10">
        {/* Desktop Table */}
        <table className="hidden lg:table w-full text-left font-mono text-sm">
          <thead className="bg-[#00f2fe]/5 text-[#00f2fe] sticky top-0 backdrop-blur-md z-10">
            <tr>
              <th className="p-4 border-b border-[#00f2fe]/20">Producto</th>
              <th className="p-4 border-b border-[#00f2fe]/20">Categoría</th>
              <th className="p-4 border-b border-[#00f2fe]/20 text-right">P. Venta</th>
              <th className="p-4 border-b border-[#00f2fe]/20 text-right text-[#00f2fe]/50">P. Min</th>
              {userRole === "admin" && (
                 <th className="p-4 border-b border-[#ff5500]/30 text-right text-[#ff5500]">Costo</th>
              )}
              <th className="p-4 border-b border-[#00f2fe]/20 text-right">Stock</th>
              <th className="p-4 border-b border-[#00f2fe]/20 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const lowStock = p.stock_actual <= p.stock_minimo;
              return (
                <tr key={p.id} className="border-b border-gray-800 hover:bg-[#00f2fe]/5 transition-colors">
                  <td className="p-4 flex items-center gap-2">
                    {lowStock && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                    {p.nombre}
                    {userRole === "admin" && (p.precio_compra === null || p.precio_compra === undefined) && (
                      <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded border border-red-500/30 animate-pulse">
                        FALTA COSTO
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400">{p.categoria}</td>
                  <td className="p-4 text-right text-gray-400">${p.precio_venta.toFixed(2)}</td>
                  <td className="p-4 text-right text-gray-500">${p.precio_minimo?.toFixed(2) ?? "0.00"}</td>
                  {userRole === "admin" && (
                    <td className="p-4 text-right text-[#ff5500]/80">${p.precio_compra?.toFixed(2)}</td>
                  )}
                  <td className={`p-4 text-right font-bold ${lowStock ? 'text-red-500' : 'text-[#00f2fe]'}`}>
                    {p.stock_actual}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => { setEditingProduct(p); setIsFormOpen(true); }}
                      className="text-[#00f2fe]/60 hover:text-[#00f2fe] transition-colors"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden flex flex-col gap-3">
          {filteredProducts.map((p) => {
            const lowStock = p.stock_actual <= p.stock_minimo;
            return (
              <div key={p.id} className={`cyber-panel p-4 rounded-lg flex flex-col gap-2 relative ${lowStock ? 'border-[#ff5500]/40 bg-[#ff5500]/5' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-mono text-white text-sm font-bold flex flex-wrap items-center gap-2">
                      {lowStock && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                      {p.nombre}
                      {userRole === "admin" && (p.precio_compra === null || p.precio_compra === undefined) && (
                        <span className="text-[8px] bg-red-500/20 text-red-500 px-1 py-0.5 rounded border border-red-500/30">
                          FALTA COSTO
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] font-mono text-[#00f2fe]/60 uppercase">{p.categoria}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-mono font-bold ${lowStock ? 'text-red-500' : 'text-[#00f2fe]'}`}>
                      {p.stock_actual}
                    </span>
                    <p className="text-[10px] text-gray-500 uppercase">Stock</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#00f2fe]/10">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Precio Venta</p>
                    <p className="font-mono text-white text-sm">${p.precio_venta.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Precio Mínimo</p>
                    <p className="font-mono text-white/50 text-sm">${p.precio_minimo?.toFixed(2) ?? "0.00"}</p>
                  </div>
                  {userRole === "admin" && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-[#ff5500]/60 uppercase">Costo</p>
                      <p className="font-mono text-[#ff5500] text-sm">${p.precio_compra?.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => { setEditingProduct(p); setIsFormOpen(true); }}
                  className="absolute bottom-4 right-4 text-[#00f2fe]/60 hover:text-[#00f2fe] p-2"
                >
                  <Edit2 className="w-5 h-5 line" />
                </button>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-mono text-sm">
            NO SE ENCONTRARON REGISTROS.
          </div>
        )}
      </div>

      {isFormOpen && (
        <ProductForm 
          categories={categories} 
          initialData={editingProduct || undefined}
          userRole={userRole}
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
