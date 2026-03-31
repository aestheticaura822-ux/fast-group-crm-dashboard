"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface LeadStats {
  hot: number;
  warm: number;
  cold: number;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const supabase = createClient();
  
  const [leadStats, setLeadStats] = useState<LeadStats>({
    hot: 0,
    warm: 0,
    cold: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const { data: leads, error } = await supabase
          .from('leads')
          .select('type, status');

        if (error) throw error;

        const stats = {
          hot: leads?.filter(l => l.type === 'hot').length || 0,
          warm: leads?.filter(l => l.type === 'warm').length || 0,
          cold: leads?.filter(l => l.type === 'cold').length || 0
        };
        setLeadStats(stats);

      } catch (error) {
        console.error('Error fetching sidebar stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const channel = supabase
      .channel('sidebar-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const adminNav = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { name: "Team Members", href: "/admin/users", icon: "👥" },
    { name: "Reports", href: "/admin/reports", icon: "📊" },
  ];

  const csrNav = [
    { name: "Lead Queue", href: "/csr/leads", icon: "📋" },
    { name: "Activity Page", href: "/csr/activities", icon: "📊" },
  ];

  const salesNav = [
    { name: "Ready to Convert", href: "/sales/leads", icon: "🎯" },
    { name: "Conversion Desk", href: "/sales/convert", icon: "💰" },
    { name: "Sales Reports", href: "/sales/reports", icon: "📊" },
  ];

  const getNavItems = () => {
    switch (user?.role) {
      case "admin": return adminNav;
      case "csr": return csrNav;
      case "sales": return salesNav;
      default: return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="relative w-full bg-white border-r border-gray-200 shadow-sm h-full">
      <div className="h-full flex flex-col">
        {/* Logo Section */}
        <div className="h-16 px-3 sm:px-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C41E3A] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">FG</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Fast Group</h1>
              <p className="text-[10px] text-gray-500">Lead Management</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#C41E3A] to-[#8B1528] rounded-lg flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <p className="text-[10px] text-gray-500 capitalize">
                  {user?.role || "Guest"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 sm:py-4">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Main Menu
            </p>
          </div>
          <ul className="space-y-0.5 px-2 sm:px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm transition-colors cursor-pointer
                      ${isActive ? "bg-[#C41E3A] text-white" : "text-gray-700 hover:bg-gray-100"}
                    `}
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-sm sm:text-base">{item.icon}</span>
                    <span className="text-xs sm:text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Lead Type Quick Access */}
          <div className="mt-5 sm:mt-6 px-2 sm:px-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Lead Types
            </p>
            <div className="space-y-1">
              {[
                { label: "Hot Leads", color: "bg-red-100 text-red-700", icon: "🔥", count: leadStats.hot },
                { label: "Warm Leads", color: "bg-yellow-100 text-yellow-700", icon: "⭐", count: leadStats.warm },
                { label: "Cold Leads", color: "bg-blue-100 text-blue-700", icon: "❄️", count: leadStats.cold },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between px-2 sm:px-3 py-1.5 rounded-md bg-gray-50">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[11px] sm:text-xs">{item.icon}</span>
                    <span className="text-[11px] sm:text-xs text-gray-700">{item.label}</span>
                  </div>
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${item.color}`}>
                    {loading ? "..." : item.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
                <span>Total Leads</span>
                <span className="font-medium text-gray-900">
                  {loading ? "..." : leadStats.hot + leadStats.warm + leadStats.cold}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 sm:p-4">
          <div className="space-y-2">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="text-sm sm:text-base">🚪</span>
              <span>Sign Out</span>
            </button>
            <div className="text-[10px] text-gray-400 text-center">
              v2.0.1 • © 2026 Fast Group
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}