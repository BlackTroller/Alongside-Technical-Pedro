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
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single()

    if (productError || !product) {
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

    const { data: merchantStores } = await supabase
      .from("stores")
      .select("id")
      .eq("merchant_id", merchant.id)

    const merchantStoreIds = merchantStores?.map(s => s.id) || []

    const { data: spList } = await supabase
      .from("store_products")
      .select("store_id")
      .eq("product_id", id)
    
    let authorized = false
    
    if (spList && spList.length > 0) {
      for (const sp of spList) {
        if (merchantStoreIds.includes(sp.store_id)) {
          authorized = true
          break
        }
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    await supabase.from("store_products").delete().eq("product_id", id)
    
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}