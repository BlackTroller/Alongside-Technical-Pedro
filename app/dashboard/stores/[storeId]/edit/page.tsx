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
import { Switch } from "@/components/ui/switch";
import {
  Store,
  MapPin,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Phone,
  Globe,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";

const StoreMapSelector = dynamic(
  () => import("@/components/stores/MapSelector"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">
        A carregar mapa...
      </div>
    ),
  },
);

export default function EditStorePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const router = useRouter();
  const { t } = useTranslations();
  const [storeId, setStoreId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    timezone: "Europe/Lisbon",
  });

  const [isActive, setIsActive] = useState(true);
  const [coords, setCoords] = useState({ lat: "41.1579", lng: "-8.6291" });

  const [addressQuery, setAddressQuery] = useState("");

  const [storeProducts, setStoreProducts] = useState([
    { id: "p1", name: "Hambúrguer Clássico", price: "8.50", stock: 20 },
    { id: "p2", name: "Batatas Fritas", price: "2.50", stock: 50 },
  ]);

  useEffect(() => {
    async function loadStore() {
      const { storeId: id } = await params;
      setStoreId(id);

      try {
        const res = await fetch(`/api/stores/${id}`);
        if (!res.ok) {
          router.push("/dashboard/stores");
          return;
        }
        const data = await res.json();
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          street: data.street || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          timezone: data.timezone || "Europe/Lisbon",
        });
        setIsActive(data.is_active ?? true);
        if (data.latitude && data.longitude) {
          setCoords({
            lat: data.latitude.toFixed(6),
            lng: data.longitude.toFixed(6),
          });
        }
      } catch (error) {
        console.error("Error loading store:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [params, router]);

  const triggerMapSearch = () => {
    if (formData.street || formData.zip) {
      const query = `${formData.street}, ${formData.zip}, ${formData.city}, Portugal`;
      setAddressQuery(query);
    }
  };

  const handleLocationSelect = (data: any) => {
    setCoords({
      lat: data.lat.toFixed(6),
      lng: data.lng.toFixed(6),
    });

    setFormData((prev) => ({
      ...prev,
      street: data.street || prev.street,
      city: data.city || prev.city,
      state: data.state || prev.state,
      zip: data.zip || prev.zip,
      timezone: data.timezone || prev.timezone,
    }));
  };

  const handleSave = async () => {
    setErrors({});

    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Nome é obrigatório" }));
      return;
    }
    if (!formData.phone.trim()) {
      setErrors((prev) => ({ ...prev, phone: "Telefone é obrigatório" }));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(coords.lat),
          longitude: parseFloat(coords.lng),
          is_active: isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ _form: data.error || "Erro ao guardar loja" });
        return;
      }

      router.push("/dashboard/stores");
      router.refresh();
    } catch (error) {
      setErrors({ _form: "Erro ao guardar loja" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/stores">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t("Stores.editStore")}</h2>
            <p className="text-muted-foreground text-sm font-mono">
              ID: {storeId}
            </p>
          </div>
        </div>
        <Button
          className="gap-2 bg-green-600 hover:bg-green-700"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t("Stores.saveChanges")}
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="details">{t("Stores.storeDetails")}</TabsTrigger>
          <TabsTrigger value="inventory">{t("Stores.products")}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Stores.generalInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Stores.storeName")} *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Stores.phone")} *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className={`pl-9 ${
                            errors.phone ? "border-destructive" : ""
                          }`}
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (errors.phone)
                              setErrors({ ...errors, phone: "" });
                          }}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                  {errors._form && (
                    <p className="text-sm text-destructive">{errors._form}</p>
)}

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t("Stores.storeActive")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("Stores.storeActiveHint")}
                      </p>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t("Stores.streetLabel")}</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      onBlur={triggerMapSearch} // <--- PESQUISA AO SAIR DO CAMPO
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Stores.city")}</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        onBlur={triggerMapSearch}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Stores.state")}</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Stores.zip")}</Label>
                      <Input
                        value={formData.zip}
                        onChange={(e) =>
                          setFormData({ ...formData, zip: e.target.value })
                        }
                        onBlur={triggerMapSearch} // <--- PESQUISA AO SAIR DO CAMPO
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("Stores.timezone2")}</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9 bg-muted"
                        value={formData.timezone}
                        readOnly
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t("Stores.coordinates")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={coords.lat}
                      readOnly
                      className="bg-muted text-xs"
                    />
                    <Input
                      value={coords.lng}
                      readOnly
                      className="bg-muted text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> {t("Stores.map")}
                  </CardTitle>
                  <CardDescription>
                    {t("Stores.mapHint")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[450px]">
                  <div className="h-full w-full rounded-md border overflow-hidden">
                    <StoreMapSelector 
                      onLocationSelect={handleLocationSelect}
                      initialPosition={[parseFloat(coords.lat), parseFloat(coords.lng)]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          {/* ... Conteúdo do Inventário (Tabela de produtos) ... */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("Stores.availableProducts")}</CardTitle>
                <CardDescription>
                  {t("Stores.inventoryHint")}
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> {t("Stores.linkProduct")}
              </Button>
            </CardHeader>
            <CardContent>
              {/* (A tua tabela de produtos entra aqui) */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
