import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    const { data: storeList } = await supabase
      .from("store_products")
      .select("store_id")
      .eq("product_id", id)

    let stores: any[] = []
    if (storeList && storeList.length > 0) {
      const storeIds = storeList.map(sp => sp.store_id)
      const { data: storeData } = await supabase
        .from("stores")
        .select("id, name")
        .in("id", storeIds)
      stores = storeData || []
    }

    return NextResponse.json({ ...productData, stores })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, is_available } = body

    if (!name || !price) {
      return NextResponse.json(
        { error: "Nome e preço são obrigatórios" },
        { status: 400 }
      )
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

    const { data: updated, error } = await supabase
      .from("products")
      .update({ name, description, price, is_available })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}