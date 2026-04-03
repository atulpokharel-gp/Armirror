"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home, Users, ShoppingBag, Sparkles, Heart, DollarSign,
  Camera, MessageSquare, Settings, LogOut, Zap, Menu, X
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/profiles", label: "Profiles", icon: Users },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/ar", label: "AR Try-On", icon: Camera },
  { href: "/stylist", label: "AI Stylist", icon: MessageSquare },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/prices", label: "Prices", icon: DollarSign },
  { href: "/video-preview", label: "Video", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/10 backdrop-blur-md rounded-lg p-2 text-white"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 z-40 bg-[#0a0a14] border-r border-white/5 flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">StyleMirror</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">AR Fashion</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} className={active ? "text-purple-400" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session.user.image ?? ""} />
                <AvatarFallback>{getInitials(session.user.name ?? "U")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                <p className="text-xs text-white/40 truncate">{session.user.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-white/40 hover:text-white transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
