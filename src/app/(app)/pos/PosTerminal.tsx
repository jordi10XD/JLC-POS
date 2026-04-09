"use client";

import { useState } from "react";
import { TerminalSquare, Wrench } from "lucide-react";
import { VentasTerminal } from "./VentasTerminal";
import { ReparacionesTerminal } from "./ReparacionesTerminal";

interface Product {
  id: string;
  nombre: string;
  precio_venta: number;
  precio_minimo: number;
  stock_actual: number;
  stock_minimo: number;
}

export function PosTerminal({ 
  products, 
  userId, 
  userRole 
}: { 
  products: Product[], 
  userId: string, 
  userRole: string 
}) {
  const [activeTab, setActiveTab] = useState<"VENTAS" | "REPARACIONES">("VENTAS");

  return (
    <div className="flex flex-col opacity-90 animate-in fade-in zoom-in duration-500 relative">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => setActiveTab("VENTAS")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-3 font-mono text-xs md:text-sm tracking-widest rounded-t-lg transition-colors border-b-2 ${
            activeTab === "VENTAS" 
              ? "text-[#00f2fe] border-[#00f2fe] cyber-glow-cyan bg-[#00f2fe]/10" 
              : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-900"
          }`}
        >
          <TerminalSquare className="w-4 h-4 md:w-5 md:h-5" /> TPV_VENTAS
        </button>
        <button 
          onClick={() => setActiveTab("REPARACIONES")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-3 font-mono text-xs md:text-sm tracking-widest rounded-t-lg transition-colors border-b-2 ${
            activeTab === "REPARACIONES" 
              ? "text-[#ff5500] border-[#ff5500] cyber-glow-orange bg-[#ff5500]/10" 
              : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-900"
          }`}
        >
          <Wrench className="w-4 h-4 md:w-5 md:h-5" /> REPARACIONES
        </button>
      </div>

      <div className="flex-1 cyber-panel rounded-lg rounded-tl-none relative">
        {activeTab === "VENTAS" && (
          <VentasTerminal products={products} userId={userId} />
        )}
        {activeTab === "REPARACIONES" && (
          <ReparacionesTerminal userId={userId} />
        )}
      </div>
    </div>
  );
}
