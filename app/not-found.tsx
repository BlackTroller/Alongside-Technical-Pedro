"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

export default function NotFound() {
  const { t } = useTranslations();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
      <h1 className="text-9xl font-bold tracking-tighter">404</h1>
      <p className="text-xl text-muted-foreground mt-4">{t("Common.notFound")}</p>
      <p className="text-sm text-muted-foreground mt-2">
        {t("Common.notFoundDesc")}
      </p>
      <Button asChild className="mt-8">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          {t("Common.backToHome")}
        </Link>
      </Button>
    </div>
  );
}