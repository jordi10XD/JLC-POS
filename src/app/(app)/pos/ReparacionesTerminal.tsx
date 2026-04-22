"use client";

import { useRef, useState } from "react";
import { createRepair } from "./actions";
import { CheckCircle2, Wrench, RefreshCw, Loader2 } from "lucide-react";

export function ReparacionesTerminal({ 
  userId, 
  userRole,
  userName,
  sugerencias
}: { 
  userId: string, 
  userRole: string,
  userName: string,
  sugerencias: string[]
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fecha, setFecha] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
  });

  const formAction = async (formData: FormData) => {
    setStatus("loading");
    setErrorMsg("");
    
    const result = await createRepair(userId, formData);
    
    if (result.error) {
      setStatus("error");
      setErrorMsg(result.error);
    } else {
      setStatus("success");
      formRef.current?.reset();
      
      const d = new Date();
      const offset = d.getTimezoneOffset() * 60000;
      setFecha((new Date(d.getTime() - offset)).toISOString().slice(0, 16));
      
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="w-full lg:w-2/3 p-4 lg:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#ff5500]/20 min-h-[500px]">
        {status === "success" && (
           <div className="bg-[#ff5500]/10 border border-[#ff5500]/40 text-[#ff5500] p-4 rounded mb-6 font-mono text-sm text-center cyber-glow-orange">
             <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-80" />
             REPARACIÓN INGRESADA CON ÉXITO
           </div>
        )}
        
        <form id="repair-form" action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 border border-[#ff5500]/10 p-4 lg:p-6 rounded-lg overflow-y-auto">
          <div className="flex flex-col gap-1">
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
            <p className="text-[10px] text-gray-500 mt-1 font-mono italic">Puede ser $0 inicialmente.</p>
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

          <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-1">
            <label className="text-xs text-[#ff5500]/70 font-mono tracking-widest uppercase p-1">Fecha de Ingreso</label>
            <input type="datetime-local" name="fecha" value={fecha} onChange={e => setFecha(e.target.value)} required className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-3 rounded text-sm w-full" />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-1">
            <label className="text-xs text-[#ff5500]/70 font-mono tracking-widest uppercase font-bold">Técnico / Responsable (Free Text)</label>
            <input 
              list="tecnicos-list"
              type="text" 
              name="a_cargo_de" 
              defaultValue={userName}
              required 
              className="cyber-input border-[#ff5500]/20 focus:border-[#ff5500] p-3 rounded text-sm w-full font-mono" 
              placeholder="Ingresa nombre del técnico" 
              autoComplete="off"
            />
            <datalist id="tecnicos-list">
              {sugerencias.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="md:col-span-2 mt-4 pt-4 border-t border-[#ff5500]/20">
            {errorMsg && <p className="text-red-500 font-mono text-xs mb-3 text-center">{errorMsg}</p>}
            <button 
              type="submit" 
              disabled={status === "loading"}
              className="w-full bg-[#ff5500]/10 border border-[#ff5500]/40 text-[#ff5500] hover:bg-[#ff5500]/20 transition-all font-mono font-bold tracking-widest py-4 rounded text-sm disabled:opacity-50"
            >
              {status === "loading" ? "PROCESANDO..." : "REGISTRAR ORDEN DE SERVICIO"}
            </button>
          </div>
        </form>
      </div>

      <div className="w-full lg:w-1/3 p-4 lg:p-8 flex flex-col items-center justify-center bg-black/60">
        <Wrench className="w-24 h-24 text-[#ff5500]/10 mb-6" />
        <h3 className="font-mono text-[#ff5500] text-xl tracking-widest cyber-glow-orange mb-2">SERVICE_LOG</h3>
        <p className="text-gray-500 text-sm text-center font-mono max-w-[250px] leading-relaxed">
          Ingresa descripciones detalladas de fallas para evitar ambigüedades. Las órdenes ingresarán como PENDIENTE por defecto.
        </p>
      </div>
    </div>
  );
}
