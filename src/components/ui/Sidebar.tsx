"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, ShoppingCart, BarChart3, LogOut, TerminalSquare } from "lucide-react";

interface SidebarProps {
  rol: "admin" | "vendedor";
  username: string;
}

export function Sidebar({ rol, username }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "POS_Terminal", href: "/pos", icon: TerminalSquare, allowed: ["admin", "vendedor"] },
    { name: "Inventario", href: "/inventario", icon: ShoppingCart, allowed: ["admin", "vendedor"] },
    { name: "Sys_Metrics", href: "/dashboard", icon: BarChart3, allowed: ["admin"] },
  ];

  return (
    <aside className="hidden lg:flex w-64 h-full cyber-panel flex-col border-r border-[#00f2fe]/20 relative z-20 shrink-0">
      <div className="p-6 pb-2 mb-4 border-b border-[#00f2fe]/10 flex flex-col items-center">
        <div className="relative flex items-center justify-center w-16 h-16 text-[#ff5500] mb-2">
          <Settings className="w-full h-full absolute animate-[spin_12s_linear_infinite] opacity-80" />
          <span className="font-mono text-sm font-bold cyber-glow-orange relative z-10">JLC</span>
        </div>
        <h2 className="text-[#00f2fe] font-mono font-bold tracking-widest text-lg cyber-glow-cyan">NEXUS_OS</h2>
        <div className="mt-4 text-xs font-mono text-[#00f2fe]/70 bg-black/40 px-3 py-1 rounded w-full text-center border border-[#00f2fe]/10">
          USER: {username}<br />
          PRV: [{rol.toUpperCase()}]
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          if (!link.allowed.includes(rol)) return null;
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md font-mono text-sm tracking-wide transition-all ${
                isActive
                  ? "bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 cyber-glow-cyan"
                  : "text-gray-400 hover:text-[#00f2fe] hover:bg-[#00f2fe]/5 border border-transparent"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#00f2fe]/10">
        <form action="/login" method="GET">
           {/* In actual implementation we'll wire this to logout server action, but for now it's a structural mockup */}
          <button className="flex w-full items-center gap-3 px-4 py-3 text-red-400 font-mono text-sm rounded hover:bg-red-950/30 hover:border-red-900 border border-transparent transition-all">
            <LogOut className="w-5 h-5" />
            DISCONNECT
          </button>
        </form>
      </div>
    </aside>
  );
}
