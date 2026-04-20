"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

export default function ProfilePage() {
  const { t } = useTranslations();
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
  } | null>(null);
  const [profile, setProfile] = useState<{ avatar_url?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      const [userRes, profileRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/profile"),
      ]);
      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({ avatar_url: data.avatarUrl });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("Profile.title")}</CardTitle>
          <CardDescription>
            {t("Profile.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Common.loading")}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("Profile.changeAvatar")}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                {t("Profile.avatarHint")}
              </p>
            </div>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Profile.fullName")}</label>
              <Input defaultValue={userName} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Profile.email")}</label>
              <Input defaultValue={user?.email} disabled />
              <p className="text-xs text-muted-foreground">
                {t("Profile.emailDisabled")}
              </p>
            </div>
            <Button type="submit">{t("Profile.save")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}