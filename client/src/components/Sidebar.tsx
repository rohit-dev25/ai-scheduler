import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboardIcon,
  UsersIcon,
  CalendarDaysIcon,
  Wand2Icon,
  LogOutIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
};

type NavItem = {
  name: string;
  icon: LucideIcon;
  path: string;
};

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  // TODO: replace with real auth context (e.g. useAuth()) once wired up
  const { logout, user } = {
    logout: () => {
      window.location.href = "/";
    },
    user: { name: "John Doe", email: "john@gmail.com" },
  };

  const navItems: NavItem[] = [
    { name: "Dashboard", icon: LayoutDashboardIcon, path: "/dashboard" },
    { name: "Accounts", icon: UsersIcon, path: "/accounts" },
    { name: "Scheduler", icon: CalendarDaysIcon, path: "/schedule" },
    { name: "AI Composer", icon: Wand2Icon, path: "/ai-composer" },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
      flex flex-col h-full transform transition-transform duration-200 ease-in-out
      md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="text-xl tracking-tight text-slate-800 flex items-center gap-2">
          <img src="/logo.svg" alt="logo" className="h-6 w-6" />
          Scheduler
        </div>
      </div>

      {/* Nav Section Label */}
      <div className="px-6 py-2">
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          menu
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`size-[18px] shrink-0 ${
                  isActive ? "text-blue-600" : "text-slate-500"
                }`}
              />
              {item.name}
              {isActive && (
                <span className="ml-auto w-[5px] h-5 rounded-full bg-blue-500" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer — pinned to bottom via mt-auto */}
      <div className="mt-auto p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          {/* Avatar */}
          <div className="size-9 rounded-full bg-gradient-to-br from-red-400 via-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-md shadow-pink-200 ring-2 ring-white">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* Name + Email */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">
              {user?.name}
            </div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>

        {/* Sign Out — below the profile row */}
        <button
          onClick={logout}
          className="w-full flex  gap-2 mt-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOutIcon className="size-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;