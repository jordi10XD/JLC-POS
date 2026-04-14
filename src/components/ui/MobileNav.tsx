"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, BarChart3, TerminalSquare, LogOut } from "lucide-react";

interface MobileNavProps {
  rol: "admin" | "vendedor";
}

export function MobileNav({ rol }: MobileNavProps) {
  const pathname = usePathname();

  const links = [
    { name: "POS", href: "/pos", icon: TerminalSquare, allowed: ["admin", "vendedor"] },
    { name: "LOG", href: "/tickets", icon: BarChart3, allowed: ["admin", "vendedor"] },
    { name: "INV", href: "/inventario", icon: ShoppingCart, allowed: ["admin", "vendedor"] },
    { name: "DB", href: "/dashboard", icon: BarChart3, allowed: ["admin"] },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-[#00f2fe]/20 z-50 flex items-center justify-around px-2 backdrop-blur-md">
      {links.map((link) => {
        if (!link.allowed.includes(rol)) return null;
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full h-full transition-all ${
              isActive
                ? "text-[#00f2fe] cyber-glow-cyan scale-110"
                : "text-gray-500"
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-mono uppercase tracking-tighter">
              {link.name}
            </span>
            {isActive && (
              <div className="absolute top-0 w-8 h-[2px] bg-[#00f2fe] shadow-[0_0_10px_#00f2fe]" />
            )}
          </Link>
        );
      })}
      
      <Link
        href="/login"
        className="flex flex-col items-center justify-center w-full h-full text-red-500/70"
      >
        <LogOut className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-mono uppercase tracking-tighter">Exit</span>
      </Link>
    </div>
  );
}
