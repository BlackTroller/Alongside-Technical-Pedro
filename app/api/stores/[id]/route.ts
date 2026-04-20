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

    const { data: store, error } = await supabase
      .from("stores")
      .select("*")
      .eq("id", id)
      .eq("merchant_id", merchant.id)
      .single()

    if (error) {
      console.error("Error fetching store:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(store)
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
      .update(body)
      .eq("id", id)
      .eq("merchant_id", merchant.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating store:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}