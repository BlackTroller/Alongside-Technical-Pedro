"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState("pt");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved === "pt" || saved === "en") {
      setLocale(saved);
    }
    setMounted(true);
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setLocale(newLang);
    localStorage.setItem("language", newLang);
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 right-4">
        {mounted && (
          <div className="flex gap-2">
            <button
              onClick={() => handleLanguageChange("pt")}
              className={`px-2 py-1 text-sm rounded ${
                locale === "pt" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              PT
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-2 py-1 text-sm rounded ${
                locale === "en" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              EN
            </button>
          </div>
        )}
      </div>
      <div className="mb-8">
        <img src="/logo.svg" alt="Alongside" className="h-12" />
      </div>
      {children}
    </div>
  );
}
