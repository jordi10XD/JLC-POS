import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/ui/Sidebar";
import { MobileNav } from "@/components/ui/MobileNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Obtener rol del perfil
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, nombre")
    .eq("id", user.id)
    .single();

  if (!perfil) {
    // Si no tiene perfil, forzamos un deslogueo (por seguridad)
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00f2fe]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-[#ff5500]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <Sidebar 
        rol={perfil.rol as "admin" | "vendedor"} 
        username={perfil.nombre} 
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 p-4 lg:p-6 pb-32 lg:pb-6">
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav rol={perfil.rol as "admin" | "vendedor"} />
    </div>
  );
}
