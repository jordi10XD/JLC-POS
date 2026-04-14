import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TicketsClient } from "./TicketsClient";

export default async function TicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch data
  const [
    { data: ventas },
    { data: reparaciones },
    { data: detalles },
    { data: productos },
    { data: perfiles }
  ] = await Promise.all([
    supabase.from("ventas").select("*, vendedor:perfiles(nombre)").order("fecha", { ascending: false }),
    supabase.from("reparaciones").select("*, vendedor:perfiles(nombre)").order("fecha", { ascending: false }),
    supabase.from("detalle_ventas").select("*"),
    supabase.from("productos").select("id, nombre"),
    supabase.from("perfiles").select("id, nombre")
  ]);

  return (
    <TicketsClient 
      ventas={ventas || []}
      reparaciones={reparaciones || []}
      detalles={detalles || []}
      productos={productos || []}
      perfiles={perfiles || []}
    />
  );
}
