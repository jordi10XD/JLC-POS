import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PosTerminal } from "./PosTerminal";

export default async function POSPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, nombre")
    .eq("id", user.id)
    .single();

  const rol = perfil?.rol || "vendedor";
  const userName = perfil?.nombre || "";

  const targetTable = "v_productos_vendedores"; 
  
  const { data: productsData } = await supabase
    .from(targetTable)
    .select("*")
    .order("nombre", { ascending: true });

  const { data: sugerenciasData } = await supabase
    .from("sugerencias_empleados")
    .select("nombre")
    .order("nombre");

  const sugerencias = sugerenciasData?.map(d => d.nombre) || [];

  return (
    <div className="h-full flex flex-col pointer-events-auto">
      <PosTerminal 
        products={productsData || []} 
        userId={user.id} 
        userRole={rol} 
        userName={userName}
        sugerencias={sugerencias}
        currentUserProfile={perfil}
      />
    </div>
  );
}
