"use client";

import { useEffect, useState, useCallback } from "react";
import pt from "../messages/pt.json";
import en from "../messages/en.json";

type Messages = typeof pt;

const messages: Record<string, Messages> = {
  pt,
  en,
};

const listeners = new Set<() => void>();

function notifyAll() {
  listeners.forEach((fn) => fn());
}

export function useTranslations() {
  const [locale, setLocale] = useState("pt");
  const [mounted, setMounted] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved === "pt" || saved === "en") {
      setLocale(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const handleSetLocale = useCallback((newLocale: string) => {
    if (newLocale === "pt" || newLocale === "en") {
      setLocale(newLocale);
      localStorage.setItem("language", newLocale);
      notifyAll();
    }
  }, []);

  const t = (key: string): string => {
    if (!mounted) return key;
    const keys = key.split(".");
    let value: any = messages[locale];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return { t, locale, setLocale: handleSetLocale, mounted };
}