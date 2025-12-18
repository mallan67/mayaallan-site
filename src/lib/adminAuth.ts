// src/lib/adminAuth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export function getAdminFromRequest() {
  try {
    const cookie = cookies().get("admin_token")?.value;
    if (!cookie) return null;
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      console.error("ADMIN_JWT_SECRET not set");
      return null;
    }
    const payload = jwt.verify(cookie, secret) as { sub: string; email: string; iat?: number; exp?: number };
    return payload;
  } catch (err) {
    return null;
  }
}

export function requireAdminOrThrow() {
  const admin = getAdminFromRequest();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}

