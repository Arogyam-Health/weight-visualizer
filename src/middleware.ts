import { NextRequest, NextResponse } from "next/server";

const allowedMethods = "GET, POST, DELETE, OPTIONS";
const allowedHeaders = "Content-Type, X-User-Id, X-Phone, Idempotency-Key";

function allowedOrigins(): Set<string> {
  const configured = process.env.ALLOWED_STOREFRONT_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  // The local visualizer is served by the Shopify/theme dev server on port 9292.
  // Production should always set ALLOWED_STOREFRONT_ORIGINS explicitly.
  if (configured?.length) return new Set(configured);
  if (process.env.NODE_ENV !== "production") {
    return new Set(["http://127.0.0.1:9292", "http://localhost:9292", "https://theobesitykiller.com/"]);
  }
  return new Set();
}

function withCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().has(origin)) return response;

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", allowedMethods);
  response.headers.set("Access-Control-Allow-Headers", allowedHeaders);
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.append("Vary", "Origin");
  return response;
}

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return withCors(request, new NextResponse(null, { status: 204 }));
  }

  return withCors(request, NextResponse.next());
}

export const config = {
  matcher: "/api/visualization/:path*",
};
