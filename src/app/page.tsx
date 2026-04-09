import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Index() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  } else {
    redirect("/pos");
  }
}
