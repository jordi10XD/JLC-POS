"use client";

import { useState, useMemo, useEffect } from "react";
import { parseISO, isAfter, isBefore, format, subDays, startOfMonth, startOfWeek } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, PlusCircle, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import { ExpensesModal } from "@/components/dashboard/ExpensesModal";

export function DashboardClient({ ventas, detalles, reparaciones, gastos, productos }: any) {
  const [filter, setFilter] = useState("ALL");
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtro Maestro
  const now = new Date();
  const getFilterDate = () => {
    if (filter === "TODAY") return subDays(now, 1); // Simplificación para demo
    if (filter === "WEEK") return startOfWeek(now);
    if (filter === "MONTH") return startOfMonth(now);
    return new Date(1970, 0, 1);
  };
  const filterDate = getFilterDate();

  const filterByDate = (arr: any[]) => arr.filter(item => isAfter(parseISO(item.fecha), filterDate) || item.fecha.startsWith(format(now, "yyyy-MM-dd")));

  const v_ventas = filterByDate(ventas);
  const v_reparaciones = filterByDate(reparaciones);
  const v_gastos = filterByDate(gastos);

  // IDs de ventas filtradas para sacar detalles válidos del periodo
  const validVentasIds = new Set(v_ventas.map(v => v.id));
  const v_detalles = detalles.filter((d: any) => validVentasIds.has(d.venta_id));

  // KPIs
  const totalIngresosVentas = v_detalles.reduce((acc: number, d: any) => acc + (d.precio_final_cobrado * d.cantidad), 0);
  const costoTotalVentas = v_detalles.reduce((acc: number, d: any) => {
    const prod = productos.find((p: any) => p.id === d.producto_id);
    return acc + ((prod?.precio_compra || 0) * d.cantidad);
  }, 0);
  
  const gananciaVentas = totalIngresosVentas - costoTotalVentas;

  const totalIngresosReparaciones = v_reparaciones.reduce((acc: number, r: any) => acc + r.valor_cobrado, 0);
  const costoTotalReparaciones = v_reparaciones.reduce((acc: number, r: any) => acc + r.costo_repuesto, 0);
  const gananciaReparaciones = totalIngresosReparaciones - costoTotalReparaciones;

  const totalIngresos = totalIngresosVentas + totalIngresosReparaciones;
  const totalGastos = v_gastos.reduce((acc: number, g: any) => acc + g.monto, 0);
  const gananciaNetaPeriodo = gananciaVentas + gananciaReparaciones - totalGastos;

  const ticketPromedio = v_ventas.length > 0 ? (totalIngresosVentas / v_ventas.length) : 0;
  
  // Patrimonio no se filtra, es estático
  const valorInventario = productos.reduce((acc: number, p: any) => acc + (p.stock_actual * (p.precio_compra || 0)), 0);
  const productosSinCosto = productos.filter((p: any) => p.precio_compra === null || p.precio_compra === undefined).length;

  // Top Products & ROIs
  const productPerformance: Record<string, { qty: number, revenue: number, cost: number }> = {};
  v_detalles.forEach((d: any) => {
    if(!productPerformance[d.producto_id]) productPerformance[d.producto_id] = { qty: 0, revenue: 0, cost: 0 };
    productPerformance[d.producto_id].qty += d.cantidad;
    productPerformance[d.producto_id].revenue += (d.precio_final_cobrado * d.cantidad);
    
    const p = productos.find((x: any) => x.id === d.producto_id);
    productPerformance[d.producto_id].cost += ((p?.precio_compra || 0) * d.cantidad);
  });

  const bestSeller = Object.entries(productPerformance).sort((a,b) => b[1].qty - a[1].qty)[0];
  const bestSellerName = bestSeller ? productos.find((p:any) => p.id === bestSeller[0])?.nombre : "N/A";

  const bestMargin = Object.entries(productPerformance).map(([id, stats]) => {
    const profit = stats.revenue - stats.cost;
    const roi = stats.cost > 0 ? (profit / stats.cost) * 100 : profit * 100; // Fake high ROI si costo es 0
    return { id, profit, roi };
  }).sort((a,b) => b.roi - a.roi)[0];
  const bestMarginName = bestMargin ? productos.find((p:any) => p.id === bestMargin.id)?.nombre : "N/A";

  // Recharts Data
  const dataBalance = [
    { name: 'Ingresos Netos', valor: totalIngresos },
    { name: 'Gastos', valor: totalGastos },
    { name: 'Utilidad Neta', valor: gananciaNetaPeriodo > 0 ? gananciaNetaPeriodo : 0 }
  ];

  const dataPie = [
    { name: 'Ventas', value: gananciaVentas },
    { name: 'Reparaciones', value: gananciaReparaciones }
  ];
  const PIE_COLORS = ['#00f2fe', '#ff5500'];

  const exportCSV = () => {
    // Generación de un Unified CSV
    let csv = "TIPO,FECHA,DESCRIPCION,INGRESOS,EGRESOS,GANANCIA_NETA\n";
    
    // Ventas
    v_ventas.forEach((v: any) => {
       const det = v_detalles.filter((d:any) => d.venta_id === v.id);
       const costo = det.reduce((acc:any, d:any) => {
         const p = productos.find((x:any) => x.id === d.producto_id);
         return acc + ((p?.precio_compra||0) * d.cantidad);
       }, 0);
       const util = v.total - costo;
       csv += `VENTA,${v.fecha},Venta ID: ${v.id},${v.total.toFixed(2)},${costo.toFixed(2)},${util.toFixed(2)}\n`;
    });

    // Reparaciones
    v_reparaciones.forEach((r: any) => {
       const util = r.valor_cobrado - r.costo_repuesto;
       csv += `REPARACION,${r.fecha},${r.cliente} - ${r.dispositivo},${r.valor_cobrado.toFixed(2)},${r.costo_repuesto.toFixed(2)},${util.toFixed(2)}\n`;
    });

    // Gastos
    v_gastos.forEach((g: any) => {
      csv += `GASTO_OPERATIVO,${g.fecha},${g.descripcion},0.00,${g.monto.toFixed(2)},-${g.monto.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jlc_report_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col animate-in fade-in zoom-in duration-500 lg:pr-2 pb-4">
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-[#00f2fe]/20 pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-mono cyber-glow-cyan text-[#00f2fe]">ANALYTICS_CORE</h1>
          <p className="font-mono text-sm text-[#00f2fe]/60 mt-1">Inteligencia Financiera.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="cyber-input px-3 py-2 rounded text-sm w-full md:w-40 font-mono"
          >
            <option value="TODAY">HOY</option>
            <option value="WEEK">ESTA SEMANA</option>
            <option value="MONTH">ESTE MES</option>
            <option value="ALL">HISTÓRICO TOTAL</option>
          </select>

          <button onClick={() => setIsExpenseOpen(true)} className="cyber-button px-4 py-2 flex items-center justify-center gap-2 rounded text-sm whitespace-nowrap w-[calc(50%-6px)] md:w-auto">
            <PlusCircle className="w-4 h-4" /> GASTO
          </button>
          
          <button onClick={exportCSV} className="bg-[#ff5500]/10 border border-[#ff5500]/50 text-[#ff5500] hover:bg-[#ff5500]/30 px-4 py-2 flex items-center justify-center gap-2 rounded text-sm transition-colors whitespace-nowrap font-mono cyber-glow-orange w-[calc(50%-6px)] md:w-auto">
            <Download className="w-4 h-4" /> EXPORT
          </button>
        </div>
      </div>

      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="cyber-panel p-4 rounded-lg border-t-2 border-t-[#00f2fe]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-[#00f2fe]/70 uppercase">Ganancia Neta</div>
            {gananciaNetaPeriodo >= 0 ? <TrendingUp className="text-[#00f2fe] w-5 h-5"/> : <TrendingDown className="text-red-500 w-5 h-5"/>}
          </div>
          <div className={`text-3xl font-mono mt-2 font-bold ${gananciaNetaPeriodo >= 0 ? 'text-white' : 'text-red-400'}`}>
            ${gananciaNetaPeriodo.toFixed(2)}
          </div>
        </div>

        <div className="cyber-panel p-4 rounded-lg border-t-2 border-t-gray-500">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-gray-400 uppercase">Ingresos vs Gastos</div>
            <DollarSign className="text-gray-400 w-5 h-5"/>
          </div>
          <div className="text-lg font-mono mt-2 text-white/90">In: ${totalIngresos.toFixed(2)}</div>
          <div className="text-lg font-mono text-[#ff5500]/80">Out: ${totalGastos.toFixed(2)}</div>
        </div>

        <div className="cyber-panel p-4 rounded-lg border-t-2 border-t-[#00f2fe]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-[#00f2fe]/70 uppercase">Ticket Promedio</div>
            <ShoppingCart className="text-[#00f2fe] w-5 h-5"/>
          </div>
          <div className="text-3xl font-mono mt-2 font-bold text-white">
            ${ticketPromedio.toFixed(2)}
          </div>
        </div>

        <div className="cyber-panel p-4 rounded-lg border-t-2 border-t-[#ff5500]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-[#ff5500]/70 uppercase">Valor Patrimonial</div>
            <Package className="text-[#ff5500] w-5 h-5"/>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <div className="text-3xl font-mono font-bold text-[#ff5500] cyber-glow-orange">
              ${valorInventario.toFixed(2)}
            </div>
            {productosSinCosto > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-mono animate-pulse mt-1">
                <AlertTriangle className="w-3 h-3" />
                {productosSinCosto} PRODUCTOS SIN COSTO REGISTRADO
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 cyber-panel p-4 rounded-lg h-80 flex flex-col">
          <h3 className="text-sm font-mono text-gray-400 mb-4 uppercase">Balance Operativo del Periodo</h3>
          <div className="flex-1 w-full min-h-[300px]">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <BarChart data={dataBalance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#555" tick={{fill: '#888', fontSize: 12, fontFamily: 'monospace'}} />
                  <YAxis stroke="#555" tick={{fill: '#888', fontSize: 12, fontFamily: 'monospace'}} />
                  <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#00f2fe33', color: '#fff'}} />
                  <Bar dataKey="valor" fill="#00f2fe" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="cyber-panel p-4 rounded-lg h-80 flex flex-col items-center">
             <h3 className="text-sm font-mono text-gray-400 mb-4 w-full uppercase">Ganancia Origen (Ventas vs ST)</h3>
              <div className="flex-1 w-full flex items-center justify-center relative min-h-[250px]">
                {gananciaVentas <= 0 && gananciaReparaciones <= 0 ? (
                  <div className="text-gray-600 font-mono text-sm">Sin ganancias positivas</div>
                ) : isMounted && (
                  <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                    <PieChart>
                      <Pie
                        data={dataPie}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {dataPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#0a0a0a', borderColor: '#00f2fe33', color: '#fff'}} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
             <div className="flex gap-4 font-mono text-xs w-full justify-center mt-2">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#00f2fe]"></div> Ventas</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#ff5500]"></div> ST</div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="cyber-panel p-5 rounded-lg flex flex-col justify-center border-l-4 border-l-[#00f2fe]">
              <div className="text-xs font-mono text-gray-400 uppercase mb-1">El más vendido (Top Mover)</div>
              <div className="text-xl font-mono text-[#00f2fe]">{bestSellerName}</div>
              {bestSeller && <div className="text-sm text-gray-500 mt-1">Unidades vendidas: {bestSeller[1].qty}</div>}
          </div>
          <div className="cyber-panel p-5 rounded-lg flex flex-col justify-center border-l-4 border-l-[#ff5500]">
              <div className="text-xs font-mono text-gray-400 uppercase mb-1">Producto más rentable (Gold Maker)</div>
              <div className="text-xl font-mono text-[#ff5500]">{bestMarginName}</div>
              {bestMargin && <div className="text-sm text-gray-500 mt-1">Margen Abs: ${bestMargin.profit.toFixed(2)} | ROI: {bestMargin.roi.toFixed(1)}%</div>}
          </div>
      </div>

      {isExpenseOpen && <ExpensesModal onClose={() => setIsExpenseOpen(false)} />}
    </div>
  );
}
