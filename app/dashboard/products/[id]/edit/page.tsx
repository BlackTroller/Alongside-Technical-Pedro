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
import { Switch } from "@/components/ui/switch";
import { Package, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
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
    params.then((p) => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      loadData();
    }
  }, [resolvedParams]);

  const loadData = async () => {
    if (!resolvedParams?.id) return;

    try {
      const res = await fetch(`/api/products/${resolvedParams.id}`);

      if (res.ok) {
        const productData = await res.json();
        setProduct(productData);
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          is_available: productData.is_available ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!product) return;

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
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
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
        setErrors({ _form: data.error || "Erro ao atualizar produto" });
        return;
      }

      router.push(`/dashboard/products/${product.id}`);
      router.refresh();
    } catch (error) {
      setErrors({ _form: "Erro ao atualizar produto" });
    } finally {
      setSaving(false);
    }
  };

  if (!resolvedParams) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/products/${resolvedParams.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Products.editProduct")}</h2>
          <p className="text-muted-foreground">
            {product?.name || t("Products.productDetails")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !product ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("Products.noProducts")}</h3>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("Products.productDetails")}
              </CardTitle>
              <CardDescription>
                {t("Products.subtitle")}
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

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="is_available" className="text-base">
                    {t("Products.productAvailable")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ao desativar, este produto ficará indisponível em todas as lojas
                  </p>
                </div>
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/products/${product.id}`)}
                  disabled={saving}
                >
                  {t("Stores.cancel")}
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("Stores.saveChanges")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}