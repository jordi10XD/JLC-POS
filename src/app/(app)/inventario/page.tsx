import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verificar el rol del usuario actual
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  const rol = (perfil?.rol || "vendedor") as "admin" | "vendedor";

  // Obtenemos los productos dependiendo del rol (las vistas evitan filtrar campos manualmente)
  const targetTable = rol === "admin" ? "productos" : "v_productos_vendedores";
  
  const { data: productsData, error } = await supabase
    .from(targetTable)
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
  }

  // Extraemos las categorías únicas
  const categories = Array.from(new Set((productsData || []).map(p => p.categoria)));

  return (
    <InventoryClient 
      initialProducts={productsData || []} 
      userRole={rol}
      categories={categories}
    />
  );
}
