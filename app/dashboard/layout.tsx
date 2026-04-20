"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Package, Store, Settings, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/logout-button";
import { useTranslations } from "@/hooks/use-translations";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
  } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function getData() {
      const [userRes, profileRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/profile"),
      ]);
      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setAvatarUrl(data.profile?.avatar_url || null);
      }
    }
    getData();
    setMounted(true);
  }, []);

  const { t } = useTranslations();

  const menuItems = [
    { name: t("Nav.home"), href: "/dashboard", icon: Home },
    { name: t("Nav.products"), href: "/dashboard/products", icon: Package },
    { name: t("Nav.stores"), href: "/dashboard/stores", icon: Store },
  ];

  const userName = user?.user_metadata?.full_name || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden w-64 border-r bg-background md:block">
        <div className="flex h-full flex-col p-4">
          <Link href="/" className="mb-8 px-2">
            <img src="/logo.svg" alt="Alongside" className="h-8" />
          </Link>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium hover:bg-muted transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="border-t pt-4">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="font-semibold text-lg">{t("Home.title")}</h1>

          {mounted && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none flex items-center gap-2 hover:opacity-80 transition">
                  <span className="text-sm font-medium">{userName}</span>
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage
                      src={avatarUrl || user?.user_metadata?.avatar_url}
                      alt={userName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/profile"
                    className="cursor-pointer w-full flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("Nav.profile")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="cursor-pointer w-full flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("Nav.settings")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <LogoutButton label={t("Nav.logout")} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          )}
        </header>

        {/* ÁREA DE CONTEÚDO */}
        <div className="p-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
