"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const storeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  street: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  zip: z.string().optional().default(""),
  timezone: z.string().optional().default("Europe/Lisbon"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export type StoreFormData = z.infer<typeof storeSchema>

export async function getStores() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("merchant_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching stores:", error)
    return []
  }

  return data
}

export async function getStore(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .eq("merchant_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching store:", error)
    return null
  }

  return data
}

export async function createStore(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const rawData = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    street: formData.get("street") || "",
    city: formData.get("city") || "",
    state: formData.get("state") || "",
    zip: formData.get("zip") || "",
    timezone: formData.get("timezone") || "Europe/Lisbon",
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
  }

  const validated = storeSchema.safeParse(rawData)

  if (!validated.success) {
    const errors = validated.error.flatten().fieldErrors
    return { error: errors }
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!merchant) {
    return { error: { _form: ["Merchant não encontrado"] } }
  }

  const { error } = await supabase.from("stores").insert({
    ...validated.data,
    merchant_id: merchant.id,
  })

  if (error) {
    return { error: { _form: [error.message] } }
  }

  revalidatePath("/dashboard/stores")
  return { success: true }
}

export async function updateStore(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const rawData = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    street: formData.get("street") || "",
    city: formData.get("city") || "",
    state: formData.get("state") || "",
    zip: formData.get("zip") || "",
    timezone: formData.get("timezone") || "Europe/Lisbon",
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
  }

  const validated = storeSchema.safeParse(rawData)

  if (!validated.success) {
    const errors = validated.error.flatten().fieldErrors
    return { error: errors }
  }

  const { error } = await supabase
    .from("stores")
    .update(validated.data)
    .eq("id", id)
    .eq("merchant_id", (
      await supabase.from("merchants").select("id").eq("user_id", user.id).single()
    ).data?.id)

  if (error) {
    return { error: { _form: [error.message] } }
  }

  revalidatePath("/dashboard/stores")
  revalidatePath(`/dashboard/stores/${id}`)
  return { success: true }
}

export async function deleteStore(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase
    .from("stores")
    .delete()
    .eq("id", id)
    .eq("merchant_id", (
      await supabase.from("merchants").select("id").eq("user_id", user.id).single()
    ).data?.id)

  if (error) {
    return { error: { _form: [error.message] } }
  }

  revalidatePath("/dashboard/stores")
  return { success: true }
}

export async function toggleStoreActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase
    .from("stores")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("merchant_id", (
      await supabase.from("merchants").select("id").eq("user_id", user.id).single()
    ).data?.id)

  if (error) {
    return { error: { _form: [error.message] } }
  }

  revalidatePath("/dashboard/stores")
  return { success: true }
}