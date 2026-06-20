import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const devLoginEmail = process.env.DEV_LOGIN_EMAIL;
  if (!devLoginEmail) {
    return NextResponse.json(
      { error: "DEV_LOGIN_EMAIL is not configured" },
      { status: 404 }
    );
  }

  const origin = request.nextUrl.origin;
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: devLoginEmail,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("[auth/dev-login] generateLink failed:", error);
    const url = new URL("/login", origin);
    url.searchParams.set("error", "dev-auth");
    return NextResponse.redirect(url, { status: 303 });
  }

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) {
    console.error("[auth/dev-login] missing hashed_token");
    const url = new URL("/login", origin);
    url.searchParams.set("error", "dev-auth");
    return NextResponse.redirect(url, { status: 303 });
  }

  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("token_hash", tokenHash);
  callbackUrl.searchParams.set("type", "magiclink");

  return NextResponse.redirect(callbackUrl, { status: 303 });
}
