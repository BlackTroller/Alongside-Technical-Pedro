"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Package, Pencil, Trash2, Loader2, Euro } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "@/hooks/use-translations";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  created_at: string;
}

export default function ProductsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ storeId: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.storeId) {
      loadProducts();
    }
  }, [resolvedParams]);

  const loadProducts = async () => {
    if (!resolvedParams?.storeId) return;
    
    try {
      const res = await fetch(`/api/products?store_id=${resolvedParams.storeId}`);
      if (!res.ok) {
        console.error("Error fetching products:", res.status);
        setProducts([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tens a certeza que queres eliminar este produto? Esta ação não pode ser desfeita.")) {
      setDeletingId(id);
      try {
        await fetch("/api/products/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        await loadProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleAvailable = async (id: string, currentAvailable: boolean) => {
    try {
      await fetch("/api/products/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_available: !currentAvailable }),
      });
      await loadProducts();
    } catch (error) {
      console.error("Error toggling product:", error);
    }
  };

  if (!resolvedParams) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Products.title")}</h2>
          <p className="text-muted-foreground">
            {t("Products.subtitle")}
          </p>
        </div>

        <Button className="gap-2" asChild>
          <Link href={`/dashboard/stores/${resolvedParams.storeId}/products/new`}>
            <Plus className="h-4 w-4" />
            {t("Products.addProduct")}
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("Products.noProducts")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("Products.createFirst")}
          </p>
          <Button asChild>
            <Link href={`/dashboard/stores/${resolvedParams.storeId}/products/new`}>
              <Plus className="h-4 w-4 mr-2" />
              {t("Products.addProduct")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group relative hover:shadow-md transition-shadow overflow-hidden border-2 hover:border-primary/20"
            >
              <Link
                href={`/dashboard/stores/${resolvedParams.storeId}/products/${product.id}`}
                className="absolute inset-0 z-0"
              >
                <span className="sr-only">Ver detalhes do {product.name}</span>
              </Link>

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm p-1 rounded-md border shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  asChild
                >
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(product.id);
                  }}
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold truncate pr-16">
                    {product.name}
                  </CardTitle>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <span className="truncate">
                    {product.description || "Sem descrição"}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-dashed">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <Euro className="h-4 w-4" />
                    {typeof product.price === "number" 
                      ? product.price.toFixed(2) 
                      : parseFloat(product.price || "0").toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleAvailable(product.id, product.is_available);
                    }}
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                      product.is_available
                        ? "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20"
                        : "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20"
                    }`}
                  >
                    {product.is_available ? t("Products.available") : t("Products.unavailable")}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Link
            href={`/dashboard/stores/${resolvedParams.storeId}/products/new`}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/20 p-6 hover:border-primary/40 hover:bg-primary/5 transition-all group min-h-[160px]"
          >
            <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary">
              {t("Products.addProduct")}
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}