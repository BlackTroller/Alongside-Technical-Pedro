import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("store_id")

    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!merchant) {
      return NextResponse.json([])
    }

    let products
    let error

    if (storeId) {
      const { data: store } = await supabase
        .from("stores")
        .select("id, merchant_id")
        .eq("id", storeId)
        .single()

      if (!store || store.merchant_id !== merchant.id) {
        return NextResponse.json([])
      }

      const { data: spData } = await supabase
        .from("store_products")
        .select("product_id")
        .eq("store_id", storeId)

      const productIds = spData?.map((sp) => sp.product_id) || []
      
      if (productIds.length === 0) {
        products = []
      } else {
        ;({ data: products, error } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds))
      }
    } else {
      const { data: stores } = await supabase
        .from("stores")
        .select("id")
        .eq("merchant_id", merchant.id)

      const storeIds = stores?.map(s => s.id) || []
      
      let linkedIds: string[] = []
      if (storeIds.length > 0) {
        const { data: spData } = await supabase
          .from("store_products")
          .select("product_id")
          .in("store_id", storeIds)
        linkedIds = [...new Set(spData?.map(sp => sp.product_id) || [])]
      }
      
      const { data: allProducts, error: allError } = await supabase
        .from("products")
        .select("id")

      if (!allError && allProducts) {
        const allProductIds = allProducts.map(p => p.id)
        linkedIds = [...new Set([...linkedIds, ...allProductIds])]
      }
      
      linkedIds = [...new Set(linkedIds)]
      
      if (linkedIds.length === 0) {
        products = []
      } else {
        ;({ data: products, error } = await supabase
          .from("products")
          .select("*")
          .in("id", linkedIds)
          .order("created_at", { ascending: false }))
      }
    }

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(products || [])
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
    const { name, description, price, is_available, store_id } = body

    if (!name || !price) {
      return NextResponse.json(
        { error: "Nome e preço são obrigatórios" },
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

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name,
        description: description || "",
        price,
        is_available: is_available !== false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (store_id) {
      const { data: store } = await supabase
        .from("stores")
        .select("id, merchant_id")
        .eq("id", store_id)
        .single()

      if (store && store.merchant_id === merchant.id) {
        await supabase
          .from("store_products")
          .insert({
            store_id,
            product_id: product.id,
          })
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}