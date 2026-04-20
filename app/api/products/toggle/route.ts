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
    const { id, is_available } = body

    if (!id || is_available === undefined) {
      return NextResponse.json({ error: "ID e disponibilidade são obrigatórios" }, { status: 400 })
    }

    const { data: product } = await supabase
      .from("products")
      .select("store_id")
      .eq("id", id)
      .single()

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
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
      .eq("id", product.store_id)
      .single()

    if (!store || store.merchant_id !== merchant.id) {
      return NextResponse.json({ error: "Não autorização" }, { status: 403 })
    }

    const { error } = await supabase
      .from("products")
      .update({ is_available })
      .eq("id", id)

    if (error) {
      console.error("Error toggling product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}