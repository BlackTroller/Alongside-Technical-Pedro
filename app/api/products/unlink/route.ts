import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, store_id } = body

    if (!product_id || !store_id) {
      return NextResponse.json(
        { error: "product_id e store_id são obrigatórios" },
        { status: 400 }
      )
    }

    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!merchant) {
      return NextResponse.json({ error: "Merchant não encontrado" }, { status: 404 })
    }

    const { data: store } = await supabase
      .from("stores")
      .select("id, merchant_id")
      .eq("id", store_id)
      .single()

    if (!store || store.merchant_id !== merchant.id) {
      return NextResponse.json({ error: "Loja não encontrada ou não autorizada" }, { status: 403 })
    }

    const { error } = await supabase
      .from("store_products")
      .delete()
      .eq("store_id", store_id)
      .eq("product_id", product_id)

    if (error) {
      console.error("Error unlinking product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}