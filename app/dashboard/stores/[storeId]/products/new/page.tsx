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
import { Package, ArrowLeft, Loader2, Plus, List, Check } from "lucide-react";
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

type OptionType = "create" | "existing";

export default function NewProductPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const [storeId, setStoreId] = useState<string>("");
  const [option, setOption] = useState<OptionType>("create");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingProducts, setExistingProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    is_available: true,
  });

  useEffect(() => {
    params.then((p) => setStoreId(p.storeId));
  }, [params]);

  useEffect(() => {
    if (option === "existing" && storeId) {
      loadExistingProducts();
    }
  }, [option, storeId]);

  const loadExistingProducts = async () => {
    if (!storeId) return;
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/products?store_id=${storeId}`);
      if (res.ok) {
        const currentStoreProducts = await res.json();
        const currentStoreIds = currentStoreProducts.map((p: any) => p.id);

        const allRes = await fetch("/api/products");
        if (allRes.ok) {
          const allProducts = await allRes.json();
          const filtered = allProducts.filter((p: any) => !currentStoreIds.includes(p.id));
          setExistingProducts(filtered);
        }
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async () => {
    if (!storeId) return;
    
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

    setLoading(true);
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

      if (data?.id) {
        await fetch("/api/products/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_ids: [data.id], store_id: storeId }),
        });
      }

      router.push(`/dashboard/stores/${storeId}`);
      router.refresh();
    } catch (error) {
      setErrors({ _form: "Erro ao criar produto" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExisting = async () => {
    if (!storeId || selectedProducts.length === 0) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/products/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_ids: selectedProducts,
          store_id: storeId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Error linking products:", data.error);
      }

      router.push(`/dashboard/stores/${storeId}`);
      router.refresh();
    } catch (error) {
      console.error("Error adding products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  if (!storeId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/stores/${storeId}/products`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Products.addProduct")}</h2>
          <p className="text-muted-foreground">
            {t("Products.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant={option === "create" ? "default" : "outline"}
          onClick={() => setOption("create")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("Products.createProduct")}
        </Button>
        <Button
          variant={option === "existing" ? "default" : "outline"}
          onClick={() => setOption("existing")}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          {t("Products.linkProduct")}
        </Button>
      </div>

      {option === "create" ? (
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
                  onClick={() => router.push(`/dashboard/stores/${storeId}/products`)}
                  disabled={loading}
                >
                  {t("Stores.cancel")}
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("Products.createProduct")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                {t("Products.linkExistingProducts")}
              </CardTitle>
              <CardDescription>
                {t("Products.selectProductsToLink")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : existingProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("Products.noProductAvailable")}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {existingProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => toggleProductSelection(product.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedProducts.includes(product.id)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedProducts.includes(product.id) ? (
                          <Check className="h-5 w-5 text-primary" />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        {typeof product.price === "number" 
                          ? product.price.toFixed(2) 
                          : parseFloat(product.price || "0").toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedProducts.length > 0 && (
                <Button
                  onClick={handleAddExisting}
                  disabled={loading}
                  className="w-full mt-4"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("Products.linkProducts")} {selectedProducts.length} produto(s)
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}