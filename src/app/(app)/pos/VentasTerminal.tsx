"use client";

import { useState } from "react";
import { Search, ShoppingCart, Trash2, DollarSign, Wallet } from "lucide-react";
import { createSale } from "./actions";

interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precio_venta: number;
  precio_minimo?: number;
  stock_actual: number;
  stock_minimo: number;
}

interface CartItem extends Product {
  cart_id: string;
  cantidad: number;
  precio_final_cobrado: number;
}

export function VentasTerminal({ 
  products, 
  userId,
  userName,
  sugerencias,
  currentUserProfile
}: { 
  products: Product[], 
  userId: string,
  userName: string,
  sugerencias: string[],
  currentUserProfile: any
}) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<"Efectivo" | "Transferencia">("Efectivo");
  const [isCheckout, setIsCheckout] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [aCargoDe, setACargoDe] = useState<string>(userName || "");

  const filteredProducts = products.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (product: Product) => {
    if (product.stock_actual <= 0) return;
    
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists && exists.cantidad < product.stock_actual) {
        return prev.map(i => i.id === product.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      if (!exists) {
        return [...prev, { ...product, cart_id: Math.random().toString(36).substring(7), cantidad: 1, precio_final_cobrado: product.precio_venta }];
      }
      return prev;
    });
  };

  const removeFromCart = (cart_id: string) => {
    setCart(prev => prev.filter(i => i.cart_id !== cart_id));
  };

  const updateQuantity = (cart_id: string, qty: number) => {
    const newCart = [...cart];
    const itemIndex = newCart.findIndex(i => i.cart_id === cart_id);
    if (itemIndex >= 0) {
      if (qty > newCart[itemIndex].stock_actual) qty = newCart[itemIndex].stock_actual;
      if (qty < 1) qty = 1;
      newCart[itemIndex].cantidad = qty;
      setCart(newCart);
    }
  };

  const updateRegateoPrice = (cart_id: string, newPrice: string) => {
    const numPrice = parseFloat(newPrice);
    if (isNaN(numPrice)) return;
    
    const newCart = [...cart];
    const itemIndex = newCart.findIndex(i => i.cart_id === cart_id);
    if (itemIndex >= 0) {
      newCart[itemIndex].precio_final_cobrado = Math.max(numPrice, newCart[itemIndex].precio_minimo ?? 0);
      setCart(newCart);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.precio_final_cobrado * item.cantidad), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!aCargoDe.trim()) {
      setErrorMsg("Debes especificar un responsable de venta.");
      return;
    }

    setIsCheckout(true);
    setErrorMsg("");

    const orderData = cart.map(item => ({
      producto_id: item.id,
      cantidad: item.cantidad,
      precio_unitario_original: item.precio_venta,
      precio_final_cobrado: item.precio_final_cobrado
    }));

    const result = await createSale(userId, metodoPago, total, aCargoDe, orderData);

    if (result.error) {
      setErrorMsg(result.error);
      setIsCheckout(false);
    } else {
      if (result.lowStockAlerts && result.lowStockAlerts.length > 0) {
         const alertNames = products.filter(p => result.lowStockAlerts.includes(p.id)).map(p => p.nombre).join(", ");
         alert(`STOCK BAJO DETECTADO EN: ${alertNames}`);
      }
      setCart([]);
      setIsCheckout(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
      <div className="w-full lg:w-3/5 p-4 border lg:border-r border-[#00f2fe]/20 flex flex-col min-h-[400px] lg:h-full bg-black/20 rounded-lg">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Buscar Producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cyber-input px-4 py-3 rounded-md w-full mb-4 font-mono text-sm uppercase tracking-widest"
          />
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 pr-2">
          {filteredProducts.map(p => (
            <div key={p.id} className="border border-[#00f2fe]/20 bg-black/40 p-4 rounded-md hover:border-[#00f2fe]/60 cursor-pointer transition-colors relative" onClick={() => addToCart(p)}>
              <h3 className="font-mono text-[#00f2fe] text-sm truncate">{p.nombre}</h3>
              <div className="flex justify-between mt-2 items-center">
                <span className="font-mono text-white">${p.precio_venta.toFixed(2)}</span>
                <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${p.stock_actual > p.stock_minimo ? 'bg-[#00f2fe]/10 text-[#00f2fe]' : (p.stock_actual > 0 ? 'bg-[#ff5500]/10 text-[#ff5500]' : 'bg-red-900/40 text-red-500')}`}>
                  STOCK: {p.stock_actual}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex flex-col min-h-[400px] lg:h-full bg-[#0ef2fe]/5 rounded-lg border border-[#00f2fe]/10">
        <div className="p-4 border-b border-[#00f2fe]/20 bg-black/50">
          <h2 className="font-mono text-[#00f2fe] cyber-glow-cyan uppercase tracking-widest flex items-center gap-2">
            <ShoppingCart className="w-5 h-5"/> SESSION_CART
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cart.length === 0 && (
            <div className="text-center text-gray-500 font-mono text-sm mt-10">NO ENTRIES</div>
          )}
          {cart.map(item => (
            <div key={item.cart_id} className="border border-[#00f2fe]/10 p-3 rounded bg-black/30 flex flex-col gap-2 relative group">
              <div className="flex justify-between items-start">
                <div className="font-mono text-sm text-white pr-8 break-words flex-1">{item.nombre}</div>
                <button onClick={() => removeFromCart(item.cart_id)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 p-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
              <div className="flex items-center flex-wrap gap-2 mt-2">
                <div className="flex items-center border border-[#00f2fe]/30 rounded overflow-hidden">
                  <button onClick={() => updateQuantity(item.cart_id, item.cantidad - 1)} className="px-2 py-1 text-[#00f2fe] hover:bg-[#00f2fe]/20 font-bold">-</button>
                  <span className="px-3 font-mono text-sm text-white">{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.cart_id, item.cantidad + 1)} className="px-2 py-1 text-[#00f2fe] hover:bg-[#00f2fe]/20 font-bold">+</button>
                </div>
                
                <div className="flex flex-col text-xs text-right flex-1 gap-1 min-w-[120px]">
                  <span className="text-gray-500">Mín: ${item.precio_minimo?.toFixed(2) ?? "0.00"}</span>
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[#00f2fe]">C/U: $</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={item.precio_final_cobrado} 
                      onChange={(e) => updateRegateoPrice(item.cart_id, e.target.value)}
                      className="bg-transparent border-b border-[#00f2fe]/40 w-16 text-right outline-none text-white focus:border-[#00f2fe] transition-colors"
                      min={item.precio_minimo}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#00f2fe]/20 bg-black/80">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-gray-400">TOTAL</span>
            <span className="font-mono text-[#00f2fe] text-3xl cyber-glow-cyan">${total.toFixed(2)}</span>
          </div>

          <div className="mb-4 flex flex-col gap-1">
            <label className="text-[10px] text-[#00f2fe]/60 font-mono tracking-widest uppercase ml-1">Vendedor / Responsable de Venta</label>
            <input 
              list="vendedores-list"
              type="text"
              value={aCargoDe}
              onChange={(e) => setACargoDe(e.target.value)}
              placeholder="Ingresa nombre (o selecciona...)"
              className="cyber-input px-3 py-2 rounded text-sm w-full font-mono border-[#00f2fe]/30 focus:border-[#00f2fe]"
              required
              autoComplete="off"
            />
            <datalist id="vendedores-list">
              {sugerencias.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={() => setMetodoPago("Efectivo")} 
              className={`py-2 px-4 border rounded font-mono text-sm flex items-center justify-center gap-2 transition-all ${metodoPago === "Efectivo" ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-[#00f2fe] cyber-glow-cyan' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}
            >
              <DollarSign className="w-4 h-4"/> EFECTIVO
            </button>
            <button 
              onClick={() => setMetodoPago("Transferencia")} 
              className={`py-2 px-4 border rounded font-mono text-sm flex items-center justify-center gap-2 transition-all ${metodoPago === "Transferencia" ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-[#00f2fe] cyber-glow-cyan' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}
            >
              <Wallet className="w-4 h-4"/> TRANSFER
            </button>
          </div>

          {errorMsg && (
            <div className="text-red-500 font-mono text-xs mb-3 text-center border-l-2 border-red-500 bg-red-950/20 py-2">
              ERROR: {errorMsg}
            </div>
          )}

          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || isCheckout}
            className="w-full cyber-button py-4 rounded font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed tracking-widest"
          >
            {isCheckout ? "PROCESANDO..." : "EMITIR_ORDEN"}
          </button>
        </div>
      </div>
    </div>
  );
}
