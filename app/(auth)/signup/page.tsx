"use client";

import { signup } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { useTranslations } from "@/hooks/use-translations";

export default function SignupPage() {
  const { t } = useTranslations();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t("Auth.signup")}</CardTitle>
        <CardDescription className="text-center">
          {t("Profile.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signup as any} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Auth.name")}</label>
            <Input
              name="name"
              type="text"
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Auth.email")}</label>
            <Input
              name="email"
              type="email"
              placeholder="teu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Auth.password")}</label>
            <Input
              name="password"
              type="password"
              placeholder="Pelo menos 6 caracteres"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {t("Auth.signup")}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          {t("Auth.hasAccount")}{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
          >
            {t("Auth.loginLink")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}