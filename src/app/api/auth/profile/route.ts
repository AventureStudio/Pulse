import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// Upsert user profile after login/signup (uses service role to bypass RLS)
export async function POST(request: NextRequest) {
  try {
    const { id, email, fullName, avatarUrl } = await request.json();

    if (!id || !email) {
      return NextResponse.json({ error: "id and email required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id,
          email,
          full_name: fullName || email.split("@")[0] || "User",
          avatar_url: avatarUrl || null,
          role: "member",
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Profile upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Auth profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
