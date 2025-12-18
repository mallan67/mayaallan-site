// src/lib/adminAuth.ts
import { NextResponse } from "next/server";
import { getAdminSession } from "./session";
import { redirect } from "next/navigation";

/** Use in API route to short-circuit unauthorized requests */
export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session?.adminId) {
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
 * - If admin, return the session (so callers can use it if needed).
 */
export async function requireAdminOrThrow() {
  const session = await getAdminSession();
  if (!session?.adminId) {
    // Throw the NextResponse so the caller is short-circuited and a JSON 401 is returned
    throw NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return session;
}
