import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/dashboard";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let userId: string | undefined;
  let userEmail: string | undefined;
  let userName: string | undefined;

  if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    userId = data?.user?.id;
    userEmail = data?.user?.email;
    userName = data?.user?.user_metadata?.full_name;
  } else if (token_hash && type) {
    const { data } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email",
    });
    userId = data?.user?.id;
    userEmail = data?.user?.email;
    userName = data?.user?.user_metadata?.full_name;
  }

  // Upsert user profile
  if (userId && userEmail) {
    await supabaseAdmin.from("users").upsert(
      {
        id: userId,
        email: userEmail,
        full_name: userName || userEmail.split("@")[0] || "User",
        role: "member",
      },
      { onConflict: "id" }
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
