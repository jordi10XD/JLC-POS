"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSale(
  userId: string,
  metodo_pago: "Efectivo" | "Transferencia",
  total: number,
  a_cargo_de: string,
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
  if (!a_cargo_de) return { error: "El campo 'A cargo de' es obligatorio." };

  await supabase.from("sugerencias_empleados").upsert({ nombre: a_cargo_de }, { onConflict: "nombre" });

  const resolvedDetalles = [];
  const lowStockAlerts: string[] = [];

  for (const d of detalles) {
    const { data: prod } = await supabase.from("productos").select("stock_actual, stock_minimo").eq("id", d.producto_id).single();
    if (!prod) return { error: "Producto no encontrado: " + d.producto_id };
    
    resolvedDetalles.push({
      producto_id: d.producto_id,
      cantidad: d.cantidad,
      precio_unitario_original: d.precio_unitario_original,
      precio_final_cobrado: d.precio_final_cobrado,
      new_stock: prod.stock_actual - d.cantidad,
      is_low_stock: (prod.stock_actual - d.cantidad) <= prod.stock_minimo
    });
  }

  const { data: venta, error: ventaError } = await supabase.from("ventas").insert([{
    vendedor_id: userId,
    a_cargo_de,
    metodo_pago,
    total,
    fecha: new Date().toISOString()
  }]).select("id").single();

  if (ventaError) return { error: ventaError.message };

  for (const d of resolvedDetalles) {
    await supabase.from("detalle_ventas").insert([{
      venta_id: venta.id,
      producto_id: d.producto_id,
      cantidad: d.cantidad,
      precio_unitario_original: d.precio_unitario_original,
      precio_final_cobrado: d.precio_final_cobrado
    }]);

    await supabase.from("productos").update({ stock_actual: d.new_stock }).eq("id", d.producto_id);

    if (d.is_low_stock) lowStockAlerts.push(d.producto_id);
  }

  revalidatePath("/pos");
  revalidatePath("/inventario");

  return { success: true, lowStockAlerts };
}

export async function createRepair(userId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return { error: "Auth Failure. Recarga el sistema." };

  const cliente = formData.get("cliente") as string;
  const dispositivo = formData.get("dispositivo") as string;
  const categoria = formData.get("categoria") as string;
  const descripcion_falla = formData.get("descripcion_falla") as string;
  const rawCosto = formData.get("costo_repuesto");
  const costo_repuesto = rawCosto ? parseFloat(rawCosto as string) : 0;
  const valor_cobrado = parseFloat(formData.get("valor_cobrado") as string) || 0;
  const estado = formData.get("estado") as string || 'Pendiente';
  const a_cargo_de = formData.get("a_cargo_de") as string;

  if (!a_cargo_de) return { error: "El campo 'A cargo de' es obligatorio." };

  await supabase.from("sugerencias_empleados").upsert({ nombre: a_cargo_de }, { onConflict: "nombre" });

  const ganancia_neta = valor_cobrado - costo_repuesto;

  const fechaIngresoStr = formData.get("fecha") as string;
  const fechaIngreso = fechaIngresoStr ? new Date(fechaIngresoStr).toISOString() : new Date().toISOString();

  const { error } = await supabase.from("reparaciones").insert([{
    fecha: fechaIngreso,
    cliente,
    dispositivo,
    categoria,
    descripcion_falla,
    costo_repuesto,
    valor_cobrado,
    ganancia_neta,
    vendedor_id: userId,
    a_cargo_de,
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
  const a_cargo_de = formData.get("a_cargo_de") as string;

  if (a_cargo_de) {
    await supabase.from("sugerencias_empleados").upsert({ nombre: a_cargo_de }, { onConflict: "nombre" });
  }

  const ganancia_neta = valor_cobrado - costo_repuesto;

  const fechaIngresoStr = formData.get("fecha") as string;
  
  const updatePayload: any = {
    cliente,
    dispositivo,
    categoria,
    descripcion_falla,
    costo_repuesto,
    valor_cobrado,
    ganancia_neta,
    estado,
    a_cargo_de
  };

  if (fechaIngresoStr) {
    updatePayload.fecha = new Date(fechaIngresoStr).toISOString();
  }

  const { error } = await supabase
    .from("reparaciones")
    .update(updatePayload)
    .eq("id", repairId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pos");
  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getVendedoresSugeridos() {
  const supabase = await createClient();
  const { data } = await supabase.from("sugerencias_empleados").select("nombre").order("nombre");
  return data?.map(d => d.nombre) || [];
}

export async function deleteSale(saleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  if (perfil?.rol !== "admin" && perfil?.rol !== "vendedor") return { error: "Permiso denegado" };

  const { data: detalles, error: detError } = await supabase
    .from("detalle_ventas")
    .select("producto_id, cantidad")
    .eq("venta_id", saleId);
  
  if (detError) return { error: detError.message };

  if (detalles && detalles.length > 0) {
    for (const d of detalles) {
      const { data: prod } = await supabase
        .from("productos")
        .select("stock_actual")
        .eq("id", d.producto_id)
        .single();
      
      if (prod) {
        await supabase
          .from("productos")
          .update({ stock_actual: prod.stock_actual + d.cantidad })
          .eq("id", d.producto_id);
      }
    }
  }

  const { error } = await supabase.from("ventas").delete().eq("id", saleId);
  if (error) return { error: error.message };

  revalidatePath("/pos");
  revalidatePath("/tickets");
  revalidatePath("/inventario");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteRepair(repairId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  if (perfil?.rol !== "admin" && perfil?.rol !== "vendedor") return { error: "Permiso denegado" };

  const { error } = await supabase.from("reparaciones").delete().eq("id", repairId);
  if (error) return { error: error.message };

  revalidatePath("/pos");
  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  return { success: true };
}
