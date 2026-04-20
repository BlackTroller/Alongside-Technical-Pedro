"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";

export default function NewProductPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    is_available: true,
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = async () => {
    setErrors({});

    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: t("Products.productName") + " é obrigatório" }));
      return;
    }
    if (!formData.price.trim()) {
      setErrors((prev) => ({ ...prev, price: t("Products.productPrice") + " é obrigatório" }));
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrors((prev) => ({ ...prev, price: "Preço inválido" }));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: priceNum,
          is_available: formData.is_available,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ _form: data.error || "Erro ao criar produto" });
        return;
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      setErrors({ _form: "Erro ao criar produto" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Products.createProduct")}</h2>
          <p className="text-muted-foreground">
            {t("Products.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("Products.productDetails")}
            </CardTitle>
            <CardDescription>
              {t("Products.createFirst")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors._form && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {errors._form}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t("Products.productName")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Hambúrguer Clássico"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("Products.productDescription")}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do produto..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">{t("Products.productPrice")} (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_available" className="font-normal">
                {t("Products.productAvailable")}
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                disabled={saving}
              >
                {t("Stores.cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("Products.createProduct")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}