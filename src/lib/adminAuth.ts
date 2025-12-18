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
