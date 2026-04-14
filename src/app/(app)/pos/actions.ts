"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSale(
  userId: string,
  metodo_pago: "Efectivo" | "Transferencia",
  total: number,
  detalles: Array<{
    producto_id: string;
    cantidad: number;
    precio_unitario_original: number;
    precio_final_cobrado: number;
  }>
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return { error: "Auth Failure. Recarga el sistema." };

  const { data, error } = await supabase.rpc("procesar_venta", {
    p_vendedor_id: userId,
    p_metodo_pago: metodo_pago,
    p_total: total,
    p_detalles: detalles
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pos");
  revalidatePath("/inventario");

  return { success: true, lowStockAlerts: data?.low_stock_alerts || [] };
}

export async function createRepair(userId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return { error: "Auth Failure. Recarga el sistema." };

  const cliente = formData.get("cliente") as string;
  const dispositivo = formData.get("dispositivo") as string;
  const categoria = formData.get("categoria") as string;
  const descripcion_falla = formData.get("descripcion_falla") as string;
  const costo_repuesto = parseFloat(formData.get("costo_repuesto") as string) || 0;
  const valor_cobrado = parseFloat(formData.get("valor_cobrado") as string) || 0;

  const estado = formData.get("estado") as string || 'Pendiente';

  const { error } = await supabase.from("reparaciones").insert([{
    fecha: new Date().toISOString(),
    cliente,
    dispositivo,
    categoria,
    descripcion_falla,
    costo_repuesto,
    valor_cobrado,
    vendedor_id: userId,
    estado
  }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pos");
  revalidatePath("/tickets");
  return { success: true };
}

export async function updateRepair(repairId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Auth Failure. Recarga el sistema." };

  const cliente = formData.get("cliente") as string;
  const dispositivo = formData.get("dispositivo") as string;
  const categoria = formData.get("categoria") as string;
  const descripcion_falla = formData.get("descripcion_falla") as string;
  const costo_repuesto = parseFloat(formData.get("costo_repuesto") as string) || 0;
  const valor_cobrado = parseFloat(formData.get("valor_cobrado") as string) || 0;
  const estado = formData.get("estado") as string;

  const { error } = await supabase
    .from("reparaciones")
    .update({
      cliente,
      dispositivo,
      categoria,
      descripcion_falla,
      costo_repuesto,
      valor_cobrado,
      estado
    })
    .eq("id", repairId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pos");
  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  return { success: true };
}
