import { createHash } from "crypto";
import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export type AdminSession = IronSession<{ adminId?: number }>;

function getSessionPassword() {
  const raw = process.env.SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!raw) throw new Error("Missing SESSION_SECRET or ADMIN_PASSWORD for admin auth/session");
  if (raw.length >= 32) return raw;
  return createHash("sha256").update(raw).digest("hex");
}

export const sessionOptions = {
  password: getSessionPassword(),
  cookieName: "mayaallan_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    httpOnly: true,
    path: "/",
  },
};

export async function getAdminSession() {
  return getIronSession(cookies(), sessionOptions) as Promise<AdminSession>;
}
