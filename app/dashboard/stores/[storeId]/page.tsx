"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Store,
  Package,
  MapPin,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Globe,
  Loader2,
  Euro,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
}

const StoreMapView = dynamic(
  () => import("@/components/stores/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">
        A carregar mapa...
      </div>
    ),
  },
);

interface StoreData {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  timezone: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export default function StoreDetailsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const router = useRouter();
  const { t } = useTranslations();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  useEffect(() => {
    loadStoreData();
  }, [params, router]);

  const loadStoreData = async () => {
    const { storeId } = await params;
    try {
      const res = await fetch(`/api/stores/${storeId}`);
      if (!res.ok) {
        router.push("/dashboard/stores");
        return;
      }
      const data = await res.json();
      setStore(data);

      const productsRes = await fetch(`/api/products?store_id=${storeId}`);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (error) {
      console.error("Error loading store:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!store) return;
    if (confirm("Tens a certeza que queres eliminar esta loja? Esta ação não pode ser desfeita.")) {
      setDeleting(true);
      try {
        const formData = new FormData();
        formData.append("id", store.id);
        await fetch("/api/stores/delete", {
          method: "POST",
          body: formData,
        });
        router.push("/dashboard/stores");
      } catch (error) {
        console.error("Error deleting store:", error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleUnlinkProduct = async (productId: string) => {
    if (!store) return;
    if (confirm(t("Products.removeProductConfirm"))) {
      setUnlinkingId(productId);
      try {
        await fetch("/api/products/unlink", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId, store_id: store.id }),
        });
        await loadStoreData();
      } catch (error) {
        console.error("Error unlinking product:", error);
      } finally {
        setUnlinkingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loja não encontrada</p>
      </div>
    );
  }

  // Limpar nome da rua para display
  const cleanStreet = (street: string) => {
    if (!street) return "";
    if (street.includes(",") && street.length > 40) {
      return street.split(",")[0].trim();
    }
    return street;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/stores">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">{store.name}</h2>
              <Badge
                variant="outline"
                className={
                  store.is_active
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-orange-50 text-orange-700 border-orange-200"
                }
              >
                {store.is_active ? t("Stores.active") : t("Stores.inactive")}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {cleanStreet(store.street) && store.city
                ? `${cleanStreet(store.street)}, ${store.city}`
                : store.city || store.state || "Sem morada"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href={`/dashboard/stores/${store.id}/edit`}>
              <Pencil className="h-4 w-4" />
              {t("Common.edit")}
            </Link>
          </Button>

          <Button
            variant="outline"
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t("Stores.deleteStore")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {t("Stores.storeDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("Common.name")}</Label>
                <p className="font-medium">{store.name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("Stores.phone")}</Label>
                <p className="font-medium">{store.phone}</p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("Stores.streetLabel")}</Label>
              <p className="font-medium">
                {store.street || "—"}
                {store.zip && `, ${store.zip}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("Stores.city")}</Label>
                <p className="font-medium">{store.city || "—"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("Stores.state")}</Label>
                <p className="font-medium">{store.state || "—"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("Stores.timezone2")}</Label>
              <p className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {store.timezone}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("Stores.location")}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {store.latitude && store.longitude ? (
              <div className="h-full w-full rounded-md border overflow-hidden">
                <StoreMapView
                  position={[store.latitude, store.longitude]}
                  address={store.street}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t("Stores.noCoordinates")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" /> {t("Stores.products")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("Stores.inventory")}</CardTitle>
                <CardDescription>
                  {t("Stores.inventoryDesc")}
                </CardDescription>
              </div>
              <Button className="gap-2" asChild>
                <Link href={`/dashboard/stores/${store.id}/products/new`}>
                  <Plus className="h-4 w-4" />
                  {t("Stores.addProduct")}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium">{t("Stores.noProducts")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("Stores.noProductsHint")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        product.is_available 
                          ? "hover:bg-muted/50" 
                          : "opacity-50 bg-muted/20"
                      }`}
                    >
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <Package className={`h-5 w-5 ${!product.is_available ? "text-orange-500" : "text-muted-foreground"}`} />
<div>
                           <p className="font-medium">{product.name}</p>
                           {product.description && (
                             <p className="text-sm text-muted-foreground line-clamp-1">
                               {product.description}
                             </p>
                           )}
</div>
                        </Link>
                        <div className="flex items-center gap-2">
                          {!product.is_available && (
                            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-200">
                              {t("Products.unavailable")}
                            </span>
                          )}
                          <span className="font-semibold flex items-center gap-1">
                            <Euro className="h-4 w-4" />
                            {(typeof product.price === "number" 
                              ? product.price 
                              : parseFloat(product.price || "0")
                            ).toFixed(2)}
                          </span>
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
                          disabled={unlinkingId === product.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUnlinkProduct(product.id);
                          }}
                        >
                          {unlinkingId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}