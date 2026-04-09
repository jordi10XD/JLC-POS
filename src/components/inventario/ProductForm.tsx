"use client";

import { useActionState, useEffect, useState } from "react";
import { upsertProduct } from "@/app/(app)/inventario/actions";

interface Product {
  id?: string;
  nombre: string;
  categoria: string;
  precio_venta: number;
  precio_minimo: number;
  precio_compra?: number;
  stock_actual: number;
  stock_minimo: number;
}

export function ProductForm({ categories, initialData, userRole, onClose }: { categories: string[], initialData?: Product, userRole: "admin" | "vendedor", onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(upsertProduct, null);
  const [typedCategory, setTypedCategory] = useState(initialData?.categoria || "");

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="cyber-panel w-full max-w-lg p-4 sm:p-6 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-[#00f2fe]/30 relative overflow-y-auto max-h-[95vh]">
        <h2 className="text-[#00f2fe] font-mono text-xl mb-4 cyber-glow-cyan border-b border-[#00f2fe]/20 pb-2">
          {initialData ? "EDITAR_PRODUCTO" : "NUEVO_PRODUCTO"}
        </h2>
        
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-3 mb-4 rounded flex items-center gap-3 animate-bounce">
              <span className="text-red-500 font-mono text-xs uppercase">ERROR: {state.error}</span>
            </div>
          )}
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#00f2fe]/70 uppercase">Nombre</label>
              <input name="nombre" defaultValue={initialData?.nombre} required className="cyber-input p-2 rounded text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#00f2fe]/70 uppercase">Categoría</label>
              <input 
                name="categoria" 
                list="category-list"
                value={typedCategory}
                onChange={(e) => setTypedCategory(e.target.value)}
                required
                autoComplete="off"
                className="cyber-input p-2 rounded text-sm" 
              />
              <datalist id="category-list">
                {categories.map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#00f2fe]/70 uppercase">P. Venta ($)</label>
              <input name="precio_venta" type="number" step="0.01" defaultValue={initialData?.precio_venta} required className="cyber-input p-2 rounded text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#00f2fe]/70 uppercase">P. Mínimo ($)</label>
              <input 
                name="precio_minimo" 
                type="number" 
                step="0.01" 
                defaultValue={initialData?.precio_minimo} 
                disabled={userRole !== "admin"}
                required={userRole === "admin"}
                className={`cyber-input p-2 rounded text-sm ${userRole !== "admin" ? "opacity-50 cursor-not-allowed bg-white/5" : ""}`} 
              />
            </div>

            {userRole === "admin" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#ff5500]/70 uppercase">P. Compra ($)</label>
                <input name="precio_compra" type="number" step="0.01" defaultValue={initialData?.precio_compra} className="cyber-input border-[#ff5500]/30 focus:border-[#ff5500] p-2 rounded text-sm" />
              </div>
            )}
            
            <div className="flex flex-col gap-1"></div> {/* Spacer */}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#00f2fe]/70 uppercase">Stock Actual</label>
              <input name="stock_actual" type="number" defaultValue={initialData?.stock_actual || 0} required className="cyber-input p-2 rounded text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#00f2fe]/70 uppercase">Stock Mínimo</label>
              <input name="stock_minimo" type="number" defaultValue={initialData?.stock_minimo || 1} required className="cyber-input p-2 rounded text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#00f2fe]/20">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-mono text-sm transition-colors">
              CANCELAR
            </button>
            <button type="submit" disabled={isPending} className="cyber-button px-6 py-2 rounded text-sm">
              {isPending ? "PROCESANDO..." : "GUARDAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
