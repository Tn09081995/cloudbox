import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/drive";
  const authError = searchParams.get("error_description") || searchParams.get("error");

  if (authError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(authError)}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        const user = data.user;
        const profileName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Người dùng Google";

        const authUser = {
          name: profileName,
          email: user.email || "",
          avatar:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            "",
        };

        const response = NextResponse.redirect(`${origin}${next}`);

        response.cookies.set(
          "cloudbox_user_session",
          encodeURIComponent(JSON.stringify(authUser)),
          {
            path: "/",
            maxAge: 604800,
            sameSite: "lax",
          }
        );
        response.cookies.set("cloudbox_session", "1", {
          path: "/",
          maxAge: 604800,
          sameSite: "lax",
        });

        return response;
      }
    } catch {
      // Fallback redirect
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
