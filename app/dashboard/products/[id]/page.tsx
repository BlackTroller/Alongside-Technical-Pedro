"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, ArrowLeft, Pencil, Trash2, Loader2, Euro, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  created_at: string;
  store?: {
    id: string;
    name: string;
  };
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then((p) => loadProduct(p.id));
  }, [params]);

  const loadProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        setProduct(null);
        return;
      }
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error("Error loading product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    if (confirm(t("Products.deleteConfirm"))) {
      setDeleting(true);
      try {
        await fetch("/api/products/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: product.id }),
        });
        router.push("/dashboard/products");
        router.refresh();
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t("Products.productDetails")}</h2>
            <p className="text-muted-foreground">
              {product?.name || t("Products.title")}
            </p>
          </div>
        </div>

        {product && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/products/${product.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("Products.editProduct")}
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t("Products.deleteProduct")}
            </Button>
          </div>
        )}
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("Products.productName")}</p>
                  <p className="text-xl font-semibold">{product.name}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground">{t("Products.productPrice")}</p>
                  <p className="text-xl font-semibold flex items-center gap-1 justify-end">
                    <Euro className="h-5 w-5" />
                    {typeof product.price === "number" 
                      ? product.price.toFixed(2) 
                      : parseFloat(product.price || "0").toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t("Products.productDescription")}</p>
                <p className="text-sm">{product.description || t("Products.noDescription")}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t("Products.storesAssociated")}</p>
                <div className="flex flex-wrap gap-2">
                  {(product as any).stores && (product as any).stores.length > 0 ? (
                    (product as any).stores.map((store: any) => (
                      <Link 
                        key={store.id} 
                        href={`/dashboard/stores/${store.id}`}
                        className="inline-flex items-center gap-1 text-sm hover:text-primary hover:underline"
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {store.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("Products.noStoreAssociated")}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("Products.createdAt")}</p>
                  <p className="text-sm">
                    {new Date(product.created_at).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                    product.is_available
                      ? "bg-green-500/10 text-green-600 border-green-200"
                      : "bg-orange-500/10 text-orange-600 border-orange-200"
                  }`}
                >
                  {product.is_available ? t("Products.available") : t("Products.unavailable")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}