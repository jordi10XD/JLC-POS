"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { 
  Search, 
  ShoppingCart, 
  Wrench, 
  ChevronRight, 
  User, 
  Calendar, 
  DollarSign, 
  Package,
  Eye,
  X,
  Edit,
  Save,
  Loader2
} from "lucide-react";
import { updateRepair } from "@/app/(app)/pos/actions";

interface TicketClientProps {
  ventas: any[];
  reparaciones: any[];
  detalles: any[];
  productos: any[];
  perfiles: any[];
}

export function TicketsClient({ ventas, reparaciones, detalles, productos, perfiles }: TicketClientProps) {
  const [activeTab, setActiveTab] = useState<"VENTAS" | "REPARACIONES">("VENTAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [editingRepair, setEditingRepair] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter logic
  const filteredVentas = useMemo(() => {
    return ventas.filter(v => 
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.vendedor?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ventas, searchTerm]);

  const filteredReparaciones = useMemo(() => {
    return reparaciones.filter(r => 
      r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.dispositivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reparaciones, searchTerm]);

  const SaleDetailsModal = ({ sale, onClose }: { sale: any, onClose: () => void }) => {
    const saleDetalles = detalles.filter(d => d.venta_id === sale.id);
    
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="cyber-panel w-full max-w-2xl bg-[#0a0a0a] border-[#00f2fe]/30 p-6 rounded-lg shadow-[0_0_50px_rgba(0,242,254,0.1)] relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="mb-6">
            <h2 className="text-xl font-mono text-[#00f2fe] cyber-glow-cyan uppercase tracking-widest">DETALLE_VENTA: {sale.id.slice(0,8)}</h2>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm font-mono">
              <div className="text-gray-400">FECHA: <span className="text-white">{format(parseISO(sale.fecha), "dd/MM/yyyy HH:mm")}</span></div>
              <div className="text-gray-400">VENDEDOR: <span className="text-white">{sale.vendedor?.nombre || "Sistema"}</span></div>
              <div className="text-gray-400">MÉTODO: <span className="text-[#ff5500]">{sale.metodo_pago}</span></div>
              <div className="text-gray-400">TOTAL: <span className="text-[#00f2fe]">${sale.total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="border border-[#00f2fe]/10 rounded overflow-hidden">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-[#00f2fe]/5 text-[#00f2fe]/70 uppercase text-[10px] tracking-tighter">
                <tr>
                  <th className="px-4 py-2">PRODUCTO</th>
                  <th className="px-4 py-2 text-center">CANT</th>
                  <th className="px-4 py-2 text-right">PRECIO_UNIT</th>
                  <th className="px-4 py-2 text-right">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00f2fe]/5">
                {saleDetalles.map((d: any) => {
                  const prod = productos.find(p => p.id === d.producto_id);
                  return (
                    <tr key={d.id} className="text-white/80">
                      <td className="px-4 py-3">{prod?.nombre || "Desc_Error"}</td>
                      <td className="px-4 py-3 text-center">{d.cantidad}</td>
                      <td className="px-4 py-3 text-right">${d.precio_final_cobrado.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-[#00f2fe]">${(d.precio_final_cobrado * d.cantidad).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex justify-end">
             <button onClick={onClose} className="cyber-button px-6 py-2 rounded text-sm uppercase tracking-widest">CERRAR</button>
          </div>
        </div>
      </div>
    );
  };

  const RepairEditModal = ({ repair, onClose }: { repair: any, onClose: () => void }) => {
    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsUpdating(true);
      const formData = new FormData(e.currentTarget);
      const result = await updateRepair(repair.id, formData);
      setIsUpdating(false);
      if (result.error) {
        alert("Error: " + result.error);
      } else {
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300">
        <div className="cyber-panel w-full max-w-xl bg-black border-[#ff5500]/30 p-6 rounded-lg relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-xl font-mono text-[#ff5500] cyber-glow-orange mb-6 uppercase tracking-widest flex items-center gap-2">
            <Wrench className="w-5 h-5" /> GESTIONAR_ORDEN
          </h2>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Cliente</label>
              <input type="text" name="cliente" defaultValue={repair.cliente} required className="cyber-input border-[#ff5500]/20 p-2 rounded text-sm w-full" />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Dispositivo</label>
              <input type="text" name="dispositivo" defaultValue={repair.dispositivo} required className="cyber-input border-[#ff5500]/20 p-2 rounded text-sm w-full" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Categoría</label>
              <input type="text" name="categoria" defaultValue={repair.categoria} required className="cyber-input border-[#ff5500]/20 p-2 rounded text-sm w-full" />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Descripción de la Falla</label>
              <textarea name="descripcion_falla" defaultValue={repair.descripcion_falla} required className="cyber-input border-[#ff5500]/20 p-2 rounded text-sm w-full h-20 resize-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase">Costo Repuesto ($)</label>
              <input type="number" step="0.01" name="costo_repuesto" defaultValue={repair.costo_repuesto} required className="cyber-input border-[#ff5500]/20 p-2 rounded text-sm w-full" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-mono uppercase text-[#ff5500]">Valor Cobrado ($)</label>
              <input type="number" step="0.01" name="valor_cobrado" defaultValue={repair.valor_cobrado} required className="cyber-input border-[#ff5500]/40 p-2 rounded text-sm w-full font-bold text-[#ff5500]" />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] text-gray-500 font-mono uppercase text-[#00f2fe]">Estado del Servicio</label>
              <select name="estado" defaultValue={repair.estado} className="cyber-input border-[#00f2fe]/20 p-2 rounded text-sm w-full bg-black font-mono">
                <option value="Pendiente">PENDIENTE</option>
                <option value="Realizado">REALIZADO</option>
                <option value="Entregado">ENTREGADO</option>
                <option value="actualizado [pendiente]">ACTUALIZADO [PEND]</option>
                <option value="actualizado [completado]">ACTUALIZADO [CONF]</option>
                <option value="Cancelado">CANCELADO</option>
                <option value="Otros">OTROS</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2 border border-gray-800 text-gray-500 font-mono text-sm hover:text-white transition-colors uppercase"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isUpdating}
                className="cyber-button px-8 py-2 rounded text-sm uppercase tracking-widest flex items-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar_Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-[#00f2fe]/20 pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-mono cyber-glow-cyan text-[#00f2fe]">LOG_DATABASE</h1>
          <p className="font-mono text-sm text-[#00f2fe]/60 mt-1">Historial Maestro de Operaciones.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00f2fe]/40" />
          <input 
            type="text" 
            placeholder="Buscar ID o Cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cyber-input pl-10 pr-4 py-2 rounded text-sm w-full font-mono uppercase tracking-widest"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab("VENTAS")}
          className={`flex items-center gap-2 px-6 py-3 font-mono text-sm tracking-widest transition-all rounded ${activeTab === "VENTAS" ? 'bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/40 cyber-glow-cyan' : 'text-gray-500 hover:text-white'}`}
        >
          <ShoppingCart className="w-4 h-4"/> VENTAS
        </button>
        <button 
          onClick={() => setActiveTab("REPARACIONES")}
          className={`flex items-center gap-2 px-6 py-3 font-mono text-sm tracking-widest transition-all rounded ${activeTab === "REPARACIONES" ? 'bg-[#ff5500]/10 text-[#ff5500] border border-[#ff5500]/40 cyber-glow-orange' : 'text-gray-500 hover:text-white'}`}
        >
          <Wrench className="w-4 h-4"/> REPARACIONES
        </button>
      </div>

      <div className="cyber-panel rounded-lg overflow-hidden border-[#00f2fe]/10">
        {activeTab === "VENTAS" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-black/80 text-[#00f2fe]/70 uppercase text-[10px] tracking-widest border-b border-[#00f2fe]/10">
                <tr>
                  <th className="px-6 py-4">DESCRIPCIÓN_VENTA</th>
                  <th className="px-6 py-4">VENDEDOR</th>
                  <th className="px-6 py-4">FECHA_HORA</th>
                  <th className="px-6 py-4">MÉTODO</th>
                  <th className="px-6 py-4 text-right">TOTAL</th>
                  <th className="px-6 py-4 text-center">DETALLES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00f2fe]/5 bg-black/20">
                {filteredVentas.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-600 italic uppercase">No records found</td></tr>
                )}
                {filteredVentas.map(v => {
                  const saleDetalles = detalles.filter(d => d.venta_id === v.id);
                  const description = saleDetalles.map(d => {
                    const prod = productos.find(p => p.id === d.producto_id);
                    return `${d.cantidad}x ${prod?.nombre || "N/A"}`;
                  }).join(", ");

                  return (
                    <tr key={v.id} className="hover:bg-[#00f2fe]/5 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="text-white font-medium truncate max-w-[250px]" title={description}>
                              {description || "Sin descripción"}
                            </span>
                            <span className="text-[9px] text-gray-600 font-mono">HASH: {v.id.slice(0,8)}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                         <User className="w-3 h-3 text-[#00f2fe]/50" />
                         <span className="text-gray-400">{v.vendedor?.nombre || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                         <div className="flex flex-col">
                            <span>{format(parseISO(v.fecha), "yyyy-MM-dd")}</span>
                            <span className="text-[10px] opacity-50">{format(parseISO(v.fecha), "HH:mm")}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded-[2px] text-[10px] border ${v.metodo_pago === 'Efectivo' ? 'border-[#00f2fe]/30 text-[#00f2fe]' : 'border-[#ff5500]/30 text-[#ff5500]'}`}>
                          {v.metodo_pago.toUpperCase()}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white">${v.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                         <button 
                          onClick={() => setSelectedSale(v)}
                          className="p-2 text-[#00f2fe] hover:bg-[#00f2fe]/20 rounded transition-all opacity-40 group-hover:opacity-100"
                          title="Explorar Detalle"
                         >
                            <Eye className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-black/80 text-[#ff5500]/70 uppercase text-[10px] tracking-widest border-b border-[#ff5500]/10">
                <tr>
                  <th className="px-6 py-4">CLIENTE / DISPOSITIVO</th>
                  <th className="px-6 py-4">CATEGORÍA</th>
                  <th className="px-6 py-4">FALLA_REPORTADA</th>
                  <th className="px-6 py-4">ESTADO</th>
                  <th className="px-6 py-4 text-right">COBRADO</th>
                  <th className="px-6 py-4 text-center">GESTIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ff5500]/5 bg-black/20">
                {filteredReparaciones.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-600 italic uppercase">No records found</td></tr>
                )}
                {filteredReparaciones.map(r => (
                  <tr key={r.id} className="hover:bg-[#ff5500]/5 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-white font-bold uppercase">{r.cliente}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{r.dispositivo}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[#ff5500]/70 text-xs font-mono">{r.categoria || "N/A"}</span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-gray-400 text-xs truncate max-w-[200px]" title={r.descripcion_falla}>
                        {r.descripcion_falla || "Sin fallo descrito"}
                       </p>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded-[2px] text-[10px] border font-mono ${
                         r.estado === 'Entregado' ? 'border-green-500/30 text-green-500' : 
                         r.estado === 'Realizado' ? 'border-[#00f2fe]/30 text-[#00f2fe]' :
                         r.estado === 'actualizado [pendiente]' ? 'border-[#ff5500]/50 text-[#ff5500] animate-pulse' :
                         r.estado === 'actualizado [completado]' ? 'border-green-400 text-green-400 cyber-glow-cyan' :
                         'border-yellow-500/30 text-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.1)]'
                       }`}>
                        {r.estado.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex flex-col items-end">
                          <span className="font-bold text-white">${r.valor_cobrado.toFixed(2)}</span>
                          <span className="text-[9px] text-gray-600 font-mono">COSTO: ${r.costo_repuesto.toFixed(2)}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button 
                        onClick={() => setEditingRepair(r)}
                        className="p-2 text-[#ff5500] hover:bg-[#ff5500]/20 rounded transition-all opacity-40 group-hover:opacity-100"
                        title="Gestionar Reparación"
                       >
                          <Wrench className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSale && <SaleDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
      {editingRepair && <RepairEditModal repair={editingRepair} onClose={() => setEditingRepair(null)} />}
    </div>
  );
}
