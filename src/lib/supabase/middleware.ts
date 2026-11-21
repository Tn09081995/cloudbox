import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummyprojectid.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummyKeyForBuilding";

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDemoSession =
    request.cookies.get("cloudbox_demo_session")?.value === "true";
  const isAuthenticated = !!user || isDemoSession;

  const pathname = request.nextUrl.pathname;

  // Protected paths
  const isProtectedPath =
    pathname.startsWith("/drive") ||
    pathname.startsWith("/trash") ||
    pathname.startsWith("/settings");

  // Auth pages (login, register)
  const isAuthPath =
    pathname === "/login" || pathname === "/register";

  if (!isAuthenticated && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/drive";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
