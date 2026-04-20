"use client";

import { useState } from "react";
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
import { Store, MapPin, ArrowLeft, Phone, Globe, Loader2 } from "lucide-react";
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
        Loading...
      </div>
    ),
  },
);

export default function NewStorePage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const [coords, setCoords] = useState({ lat: "41.1579", lng: "-8.6291" });

  const handleSubmit = async () => {
    setErrors({});

    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Nome é obrigatório" }));
      return;
    }
    if (!formData.phone.trim()) {
      setErrors((prev) => ({ ...prev, phone: "Telefone é obrigatório" }));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(coords.lat),
          longitude: parseFloat(coords.lng),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ _form: data.error || "Erro ao criar loja" });
        return;
      }

      router.push("/dashboard/stores");
      router.refresh();
    } catch (error) {
      setErrors({ _form: "Erro ao criar loja" });
    } finally {
      setLoading(false);
    }
  };

  // ATUALIZADO: Agora recebe o objeto 'data' do novo MapSelector

  const handleLocationSelect = (data: any) => {
    setCoords({
      lat: data.lat.toFixed(6),

      lng: data.lng.toFixed(6),
    });

    // Preenchimento automático "mágico"

    setFormData((prev) => ({
      ...prev,

      street: data.street || prev.street,

      city: data.city || prev.city,

      state: data.state || prev.state,

      zip: data.zip || prev.zip,

      timezone: data.timezone || prev.timezone,
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* HEADER */}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/stores">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Stores.addStore")}</h2>

          <p className="text-muted-foreground">
            {t("Stores.createFirst")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Store className="h-5 w-5 text-primary" />
                {t("Stores.generalInfo")}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("Stores.storeName")} *</Label>

                  <Input
                    id="name"
                    placeholder="Ex: Boutique Porto"
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
                  <Label htmlFor="phone">{t("Stores.phone")} *</Label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="phone"
                      className={`pl-9 ${errors.phone ? "border-destructive" : ""}`}
                      placeholder="+351 912..."
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">{t("Stores.street")}</Label>

                <Input
                  id="street"
                  placeholder="Rua de Santa Catarina, 123"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("Stores.city")}</Label>

                  <Input
                    id="city"
                    placeholder="Porto"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">{t("Stores.state")}</Label>

                  <Input
                    id="state"
                    placeholder="Porto"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">Código Postal</Label>

                  <Input
                    id="zip"
                    placeholder="4000-000"
                    value={formData.zip}
                    onChange={(e) =>
                      setFormData({ ...formData, zip: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">{t("Stores.timezone2")}</Label>

                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="timezone"
                      className="pl-9 bg-muted cursor-default border-primary/20"
                      value={formData.timezone}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t("Stores.coordinates")}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {t("Stores.latitude")}
                  </Label>

                  <Input
                    value={coords.lat}
                    readOnly
                    className="h-8 bg-muted/50"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {t("Stores.longitude")}
                  </Label>

                  <Input
                    value={coords.lng}
                    readOnly
                    className="h-8 bg-muted/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SELECTOR DE MAPA */}

        <div className="md:col-span-2 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                {t("Stores.location")}
              </CardTitle>

              <CardDescription>
                {t("Stores.locationHint")}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 min-h-[400px]">
              <div className="h-full w-full rounded-md border overflow-hidden relative">
                <StoreMapSelector onLocationSelect={handleLocationSelect} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t pt-6">
        {errors._form && (
          <div className="w-full text-sm text-destructive">{errors._form}</div>
        )}
        <Button variant="outline" asChild>
          <Link href="/dashboard/stores">{t("Stores.cancel")}</Link>
        </Button>

        <Button size="lg" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              A guardar...
            </>
          ) : (
            t("Common.create")
          )}
        </Button>
      </div>
    </div>
  );
}
