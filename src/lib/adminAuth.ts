// src/lib/adminAuth.ts
import { Buffer } from "buffer";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "./session";

function readPasswordHeader(req?: Request | NextRequest) {
  const headerValue =
    req?.headers.get("x-admin-password") ??
    req?.headers.get("x-admin-key") ??
    req?.headers.get("authorization");

  if (!headerValue) return null;
  if (headerValue.startsWith("Bearer ")) return headerValue.slice("Bearer ".length);
  if (headerValue.startsWith("Basic ")) {
    const decoded = Buffer.from(headerValue.replace("Basic ", ""), "base64").toString("utf8");
    const [, pwd] = decoded.split(":");
    return pwd ?? null;
  }
  return headerValue;
}

export function adminPasswordMatches(input: string | null | undefined) {
  if (!process.env.ADMIN_PASSWORD) return false;
  return input === process.env.ADMIN_PASSWORD;
}

export async function isAdminAuthenticated(req?: Request | NextRequest) {
  const headerPassword = readPasswordHeader(req);
  if (adminPasswordMatches(headerPassword)) return true;

  const session = await getAdminSession();
  return !!session?.adminId;
}

/** Use in API route to short-circuit unauthorized requests */
export async function requireAdminApi(req?: Request | NextRequest) {
  const ok = await isAdminAuthenticated(req);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return null; // ok to continue
}

/** Use in server components / server pages to redirect non-admins to login */
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session?.adminId) {
    redirect("/admin/login");
  }
  return session;
}

/**
 * Synchronous-style guard used by API routes / server functions:
 * - If the current user is not an admin, throw a NextResponse to short-circuit
 *   the handler and return a 401 JSON response.
 * - If admin, return true (so callers can continue).
 */
export async function requireAdminOrThrow(req?: Request | NextRequest) {
  const ok = await isAdminAuthenticated(req);
  if (!ok) {
    // Throw the NextResponse so the caller is short-circuited and a JSON 401 is returned
    throw NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return true;
}
