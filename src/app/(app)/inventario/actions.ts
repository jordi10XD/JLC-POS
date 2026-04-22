"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertProduct(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  const esAdmin = perfil?.rol === "admin";
  
  if (perfil?.rol !== "admin" && perfil?.rol !== "vendedor") return { error: "Permiso denegado" };

  const id = formData.get("id") as string | null;
  const nombre = formData.get("nombre") as string;
  const categoria = formData.get("categoria") as string;
  const precio_venta = parseFloat(formData.get("precio_venta") as string);
  const rawMinimo = formData.get("precio_minimo");
  const precio_minimo = (rawMinimo !== null && rawMinimo !== "") ? parseFloat(rawMinimo as string) : null;
  const precio_compra_raw = formData.get("precio_compra");
  const precio_compra = (precio_compra_raw !== null && precio_compra_raw !== "") ? parseFloat(precio_compra_raw as string) : null;
  const stock_actual = parseInt(formData.get("stock_actual") as string);
  const stock_minimo = parseInt(formData.get("stock_minimo") as string);

  const productData: any = { 
    nombre, 
    categoria, 
    precio_venta, 
    stock_actual, 
    stock_minimo
  };

  if (esAdmin) {
    if (precio_compra_raw !== null) productData.precio_compra = precio_compra;
    productData.precio_minimo = precio_minimo;
  }

  if (id) {
    const { error } = await supabase.from("productos").update(productData).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("productos").insert([productData]);
    if (error) return { error: error.message };
  }

  revalidatePath("/inventario");
  return { success: true, timestamp: Date.now() }; 
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  if (perfil?.rol !== "admin" && perfil?.rol !== "vendedor") return { error: "Permiso denegado" };

  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/inventario");
  return { success: true };
}
