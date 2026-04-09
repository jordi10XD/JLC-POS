import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") {
    redirect("/pos");
  }

  // Fetch all accounting data (we fetch historical data since client side will slice and dice by Date Range Filter for smooth UI)
  const [ 
    { data: ventas }, 
    { data: detalles },
    { data: reparaciones },
    { data: gastos },
    { data: productos }
  ] = await Promise.all([
    supabase.from("ventas").select("*"),
    supabase.from("detalle_ventas").select("*"),
    supabase.from("reparaciones").select("*"),
    supabase.from("gastos").select("*"),
    supabase.from("productos").select("*") // Only admin can fetch entire 'productos' with precio_compra securely
  ]);

  return (
    <DashboardClient 
      ventas={ventas || []}
      detalles={detalles || []}
      reparaciones={reparaciones || []}
      gastos={gastos || []}
      productos={productos || []}
    />
  );
}
