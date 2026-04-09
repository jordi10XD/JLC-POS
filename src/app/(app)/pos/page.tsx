import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PosTerminal } from "./PosTerminal";

export default async function POSPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the role
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, nombre")
    .eq("id", user.id)
    .single();

  const rol = perfil?.rol || "vendedor";

  // Fetch products safely using the view for vendors (which admins can also read)
  // Actually, either 'productos' or 'v_productos_vendedores' is fine.
  const targetTable = "v_productos_vendedores"; 
  
  const { data: productsData } = await supabase
    .from(targetTable)
    .select("*")
    .order("nombre", { ascending: true });

  return (
    <div className="h-full flex flex-col pointer-events-auto">
      <PosTerminal 
        products={productsData || []} 
        userId={user.id} 
        userRole={rol} 
      />
    </div>
  );
}
