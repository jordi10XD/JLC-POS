"use client";

import { useActionState, useEffect } from "react";
import { createExpense } from "@/app/(app)/dashboard/actions";

export function ExpensesModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createExpense, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="cyber-panel w-full max-w-sm p-6 rounded-lg shadow-2xl border border-[#ff5500]/30 animate-in zoom-in-95 duration-200">
        <h2 className="text-[#ff5500] font-mono text-xl mb-4 cyber-glow-orange border-b border-[#ff5500]/20 pb-2">
          REGISTRAR_GASTO
        </h2>
        
        <form action={formAction} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-[#ff5500]/70 uppercase">Descripción</label>
            <input name="descripcion" required placeholder="Pago a proveedor..." className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-2 rounded text-sm" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-[#ff5500]/70 uppercase">Monto ($)</label>
            <input name="monto" type="number" step="0.01" required className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-2 rounded text-sm" />
          </div>
          
          {state?.error && <div className="text-red-400 text-xs font-mono text-center">ERROR: {state.error}</div>}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#ff5500]/20">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-mono text-sm transition-colors">
              CANCELAR
            </button>
            <button type="submit" disabled={isPending} className="bg-[#ff5500]/20 text-[#ff5500] border border-[#ff5500]/50 hover:bg-[#ff5500]/40 px-6 py-2 rounded text-sm font-mono transition-all">
              {isPending ? "ENVIANDO..." : "CONFIRMAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
