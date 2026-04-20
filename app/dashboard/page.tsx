"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Store, Plus, AlertTriangle, Loader2, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import Link from "next/link";

export default function DashboardPage() {
  const { t } = useTranslations();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/me");
        const userData = await userRes.json();
        
        if (userData?.email) {
          const name = userData.email.split("@")[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }

        const [productsRes, storesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/stores"),
        ]);
        
        const productsData = await productsRes.json();
        const storesData = await storesRes.json();
        
        setProducts(Array.isArray(productsData) ? productsData : []);
        setStores(Array.isArray(storesData) ? storesData : []);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const recentProducts = products.slice(0, 5);
  const unavailableProducts = products.filter(p => !p.is_available);
  const inactiveStores = stores.filter(s => !s.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t("Home.welcome")}, {userName}!
        </h1>
        
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/stores/new" className="gap-2">
              <Plus className="h-4 w-4" />
              {t("Stores.addStore")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/products/new" className="gap-2">
              <Plus className="h-4 w-4" />
              {t("Products.addProduct")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {t("Nav.products")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : products.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {t("Nav.stores")}
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stores.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {(unavailableProducts.length > 0 || inactiveStores.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <button 
              onClick={() => setShowAlerts(!showAlerts)}
              className="flex items-center justify-between w-full text-left"
            >
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                {t("Home.alerts")} ({unavailableProducts.length + inactiveStores.length})
              </CardTitle>
              {showAlerts ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {showAlerts && (
            <CardContent>
              <div className="space-y-1">
                {unavailableProducts.map((product) => (
                  <Link 
                    key={`p-${product.id}`}
                    href={`/dashboard/products/${product.id}`}
                    className="flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded"
                  >
                    <span className="flex items-center gap-2 text-orange-600">
                      <Package className="h-3 w-3" />
                      {product.name}
                    </span>
                    <span className="text-xs text-orange-500">{t("Products.unavailable")}</span>
                  </Link>
                ))}
                {inactiveStores.map((store) => (
                  <Link 
                    key={`s-${store.id}`}
                    href={`/dashboard/stores/${store.id}`}
                    className="flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Store className="h-3 w-3" />
                      {store.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{t("Stores.inactive")}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("Home.recentProducts")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/products">{t("Common.viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <Link 
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                    {product.is_available ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-orange-500" />
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("Products.noProducts")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("Home.storeStatus")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/stores">{t("Common.viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : stores.length > 0 ? (
              <div className="space-y-3">
                {stores.slice(0, 5).map((store) => (
                  <Link 
                    key={store.id}
                    href={`/dashboard/stores/${store.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{store.name}</span>
                    </div>
                    {store.is_active ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {t("Stores.active")}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                        {t("Stores.inactive")}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("Stores.noStores")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}