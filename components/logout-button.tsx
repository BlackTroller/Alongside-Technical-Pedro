"use client";

import { logout } from "@/app/(auth)/actions";
import { LogOut } from "lucide-react";

export function LogoutButton({ label = "Sair" }: { label?: string }) {
  return (
    <button
      onClick={() => logout()}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      {label}
    </button>
  );
}