"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertProduct(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  if (perfil?.rol !== "admin") return { error: "Permiso denegado" };

  const id = formData.get("id") as string | null;
  const nombre = formData.get("nombre") as string;
  const categoria = formData.get("categoria") as string;
  const precio_venta = parseFloat(formData.get("precio_venta") as string);
  const precio_minimo = parseFloat(formData.get("precio_minimo") as string);
  const precio_compra = parseFloat(formData.get("precio_compra") as string);
  const stock_actual = parseInt(formData.get("stock_actual") as string);
  const stock_minimo = parseInt(formData.get("stock_minimo") as string);

  const productData = { 
    nombre, 
    categoria, 
    precio_venta, 
    precio_minimo, 
    precio_compra, 
    stock_actual, 
    stock_minimo 
  };

  if (id) {
    const { error } = await supabase.from("productos").update(productData).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("productos").insert([productData]);
    if (error) return { error: error.message };
  }

  revalidatePath("/inventario");
  return { success: true, timestamp: Date.now() }; // Timestamp to trigger effect resetting
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  if (perfil?.rol !== "admin") return { error: "Permiso denegado" };

  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/inventario");
  return { success: true };
}
