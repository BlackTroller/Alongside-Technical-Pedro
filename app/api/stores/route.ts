import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!merchant) {
      return NextResponse.json([])
    }

    const { data: stores, error } = await supabase
      .from("stores")
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching stores:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const storeIds = stores?.map(s => s.id) || []
    
    let productsByStore: Record<string, number> = {}
    if (storeIds.length > 0) {
      const { data: sp } = await supabase
        .from("store_products")
        .select("store_id, product_id")
        .in("store_id", storeIds)
      
      const { data: oldProducts } = await supabase
        .from("products")
        .select("id, store_id")
        .in("store_id", storeIds)

      productsByStore = {}
      
      for (const sp_data of (sp || [])) {
        productsByStore[sp_data.store_id] = (productsByStore[sp_data.store_id] || 0) + 1
      }
      
      for (const op of (oldProducts || [])) {
        if (op.store_id) {
          productsByStore[op.store_id] = (productsByStore[op.store_id] || 0) + 1
        }
      }
    }

    const storesWithCount = (stores || []).map((store: any) => ({
      ...store,
      products_count: productsByStore[store.id] || 0,
    }))

    return NextResponse.json(storesWithCount)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, street, city, state, zip, timezone, latitude, longitude } = body

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 }
      )
    }

    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant não encontrado" },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from("stores")
      .insert({
        merchant_id: merchant.id,
        name,
        phone,
        street: street || "",
        city: city || "",
        state: state || "",
        zip: zip || "",
        timezone: timezone || "Europe/Lisbon",
        latitude,
        longitude,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating store:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}