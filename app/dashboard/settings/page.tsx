"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslations();
  const [theme, setTheme] = useState<Theme>("system");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) setTheme(savedTheme);
    setLoading(false);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    const root = document.documentElement;
    if (newTheme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", systemPrefersDark);
    } else {
      root.classList.toggle("dark", newTheme === "dark");
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLocale(newLang as "pt" | "en");
    localStorage.setItem("language", newLang);
    // Force page to re-render with new translations
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const themes: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "light", label: t("Settings.light"), icon: Sun },
    { value: "dark", label: t("Settings.dark"), icon: Moon },
    { value: "system", label: t("Settings.system"), icon: Monitor },
  ];

  return (
    <div className="container mx-auto py-10 max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Settings.appearance")}</CardTitle>
          <CardDescription>
            {t("Settings.appearanceDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium">{t("Settings.theme")}</p>
          <div className="flex gap-2">
            {themes.map((th) => (
              <button
                key={th.value}
                onClick={() => handleThemeChange(th.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                  theme === th.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <th.icon className="h-4 w-4" />
                <span className="text-sm">{th.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Settings.language")}</CardTitle>
          <CardDescription>
            {t("Settings.languageDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium">{t("Settings.language")}</p>
          <Select value={locale} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}