import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Hold My Hand must stay reachable even if a session has expired — panic
// support is never allowed to be gated behind a login screen.
const PUBLIC_PATHS = ["/login", "/hold-my-hand"];

// Only /login should bounce an already-authenticated user away — Hold My
// Hand must stay reachable while logged in too, since that's when it's used.
const AUTH_REDIRECT_PATHS = ["/login"];

// Keep her logged in for a month at a stretch instead of re-prompting for
// credentials — this is a 2-person household app, not a banking session.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, maxAge: SESSION_MAX_AGE_SECONDS }),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));
  const isAuthRedirect = AUTH_REDIRECT_PATHS.some((p) => path.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRedirect) {
    const url = request.nextUrl.clone();
    url.pathname = "/today";
    return NextResponse.redirect(url);
  }

  if (user && path.startsWith("/settings")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/today";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|memes|apple-icon.png|icon.png|manifest.webmanifest|sw.js).*)"],
};
