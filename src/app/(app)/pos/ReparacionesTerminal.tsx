"use client";

import { useActionState, useEffect } from "react";
import { Wrench } from "lucide-react";
import { createRepair } from "@/app/(app)/pos/actions";

export function ReparacionesTerminal({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => await createRepair(userId, formData),
    null
  );

  useEffect(() => {
    if (state?.success) {
      if (document.getElementById("repair-form")) {
        (document.getElementById("repair-form") as HTMLFormElement).reset();
      }
      alert("Repair module logged successfully.");
    }
  }, [state]);

  return (
    <div className="flex flex-col p-4 lg:p-6 relative">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6 border-b border-[#ff5500]/20 pb-4">
          <Wrench className="w-6 h-6 text-[#ff5500]" />
          <div>
            <h2 className="text-[#ff5500] font-mono text-xl cyber-glow-orange tracking-widest uppercase">
              Orden_Reparaciones
            </h2>
            <p className="text-[#ff5500]/60 text-xs font-mono">Registro de servicio técnico independiente.</p>
          </div>
        </div>

        {state?.success && (
          <div className="bg-[#ff5500]/10 border border-[#ff5500]/40 text-[#ff5500] p-4 rounded mb-6 font-mono text-sm text-center cyber-glow-orange">
            NUEVA ORDEN DE REPARACIÓN INGRESADA
          </div>
        )}

        {state?.error && (
          <div className="bg-red-950/20 border border-red-500/40 text-red-500 p-4 rounded mb-6 font-mono text-sm text-center">
            SYSTEM_ERROR: {state.error}
          </div>
        )}

        <form id="repair-form" action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 border border-[#ff5500]/10 p-6 rounded-lg">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-[#ff5500]/70 font-mono tracking-widest uppercase">Cliente</label>
            <input type="text" name="cliente" required className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-3 rounded text-sm w-full" placeholder="Nombre / Teléfono" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#ff5500]/70 font-mono tracking-widest uppercase">Dispositivo</label>
            <input type="text" name="dispositivo" required className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-3 rounded text-sm" placeholder="Ej. Samsung S24 Ultra" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#ff5500]/70 font-mono tracking-widest uppercase">Categoría</label>
            <input type="text" name="categoria" required className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-3 rounded text-sm" placeholder="Ej. Cambio de Display" />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-[#ff5500]/70 font-mono tracking-widest uppercase">Falla / Descripción</label>
            <textarea name="descripcion_falla" required className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-3 rounded text-sm h-24 resize-none" placeholder="El dispositivo presenta pantalla astillada..." />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#ff5500]/70 font-mono tracking-widest uppercase">Costo Repuesto ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff5500]/50 font-mono">$</span>
              <input type="number" step="0.01" name="costo_repuesto" defaultValue="0" required className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-3 pl-8 rounded text-sm w-full" />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Puede ser $0 inicialmente.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#ff5500] font-mono tracking-widest uppercase">Valor Cobrado ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff5500] font-mono">$</span>
              <input type="number" step="0.01" name="valor_cobrado" required className="cyber-input border-[#ff5500]/50 focus:border-[#ff5500] p-3 pl-8 rounded text-sm w-full font-bold text-[#ff5500]" />
            </div>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-[#ff5500]/70 font-mono tracking-widest uppercase">Estado Inicial</label>
            <select name="estado" required className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-3 rounded text-sm w-full font-mono bg-black">
              <option value="Pendiente">PENDIENTE</option>
              <option value="Realizado">REALIZADO</option>
              <option value="Entregado">ENTREGADO</option>
              <option value="actualizado [pendiente]">ACTUALIZADO [PEND]</option>
              <option value="actualizado [completado]">ACTUALIZADO [CONF]</option>
              <option value="Cancelado">CANCELADO</option>
              <option value="Otros">OTROS</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-4 pt-4 border-t border-[#ff5500]/20">
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-[#ff5500]/10 border border-[#ff5500]/40 text-[#ff5500] hover:bg-[#ff5500]/20 transition-all font-mono font-bold tracking-widest py-4 rounded text-sm disabled:opacity-50"
            >
              {isPending ? "EMITIENDO..." : "GENERAR O.T."}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
