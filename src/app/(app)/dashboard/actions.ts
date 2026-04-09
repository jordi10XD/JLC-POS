"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExpense(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  if (perfil?.rol !== "admin") return { error: "Permiso denegado" };

  const descripcion = formData.get("descripcion") as string;
  const monto = parseFloat(formData.get("monto") as string);

  if (!descripcion || Number.isNaN(monto) || monto <= 0) {
    return { error: "Datos inválidos para el gasto." };
  }

  const { error } = await supabase.from("gastos").insert([{
    descripcion,
    monto
  }]);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true, timestamp: Date.now() };
}
