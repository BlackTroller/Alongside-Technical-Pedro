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
import { Plus, Store, MapPin, Package, Pencil, Trash2, Loader2, Phone, Clock } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "@/hooks/use-translations";
import { deleteStore, toggleStoreActive } from "@/app/dashboard/stores/actions";
import { useRouter } from "next/navigation";

interface Store {
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

interface StoreWithCount extends Store {
  products_count?: number;
}

export default function StoresPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [stores, setStores] = useState<StoreWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const res = await fetch("/api/stores");
      if (!res.ok) {
        console.error("Error fetching stores:", res.status);
        setStores([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setStores(data);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tens a certeza que queres eliminar esta loja? Esta ação não pode ser undone.")) {
      setDeletingId(id);
      try {
        const formData = new FormData();
        formData.append("id", id);
        await fetch("/api/stores/delete", {
          method: "POST",
          body: formData,
        });
        await loadStores();
      } catch (error) {
        console.error("Error deleting store:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("is_active", (!currentActive).toString());
      await fetch("/api/stores/toggle", {
        method: "POST",
        body: formData,
      });
      await loadStores();
    } catch (error) {
      console.error("Error toggling store:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Stores.title")}</h2>
          <p className="text-muted-foreground">
            {t("Stores.subtitle")}
          </p>
        </div>

        <Button className="gap-2" asChild>
          <Link href="/dashboard/stores/new">
            <Plus className="h-4 w-4" />
            {t("Stores.addStore")}
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : stores.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <Store className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("Stores.noStores")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("Stores.createFirst")}
          </p>
          <Button asChild>
            <Link href="/dashboard/stores/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("Stores.addStore")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card
              key={store.id}
              className="group relative hover:shadow-md transition-shadow overflow-hidden border-2 hover:border-primary/20"
            >
              <Link
                href={`/dashboard/stores/${store.id}`}
                className="absolute inset-0 z-0"
              >
                <span className="sr-only">Ver detalhes da {store.name}</span>
              </Link>

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm p-1 rounded-md border shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  asChild
                >
                  <Link
                    href={`/dashboard/stores/${store.id}/edit`}
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
                    handleDelete(store.id);
                  }}
                  disabled={deletingId === store.id}
                >
                  {deletingId === store.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Store className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold truncate pr-16">
                    {store.name}
                  </CardTitle>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">
                    {store.street && store.city
                      ? `${store.street}, ${store.city}`
                      : store.city || store.state || "Sem morada"}
                  </span>
                </CardDescription>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {store.phone}
                  </span>
                  {store.timezone && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {store.timezone}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-dashed">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                    <Package className="h-4 w-4" />
                    {store.products_count || 0}
                    <span className="text-xs font-normal">{t("Stores.items")}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleActive(store.id, store.is_active);
                    }}
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                      store.is_active
                        ? "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20"
                        : "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20"
                    }`}
                  >
                    {store.is_active ? t("Stores.active") : t("Stores.inactive")}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Link
            href="/dashboard/stores/new"
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/20 p-6 hover:border-primary/40 hover:bg-primary/5 transition-all group min-h-[160px]"
          >
            <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary">
              {t("Stores.addStore")}
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}