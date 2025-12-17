import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export type AdminSession = IronSession<{ adminId?: number }>;

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "mayaallan_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    httpOnly: true,
    path: "/",
  },
};

export async function getAdminSession() {
  if (!process.env.SESSION_SECRET) throw new Error("Missing SESSION_SECRET");
  return getIronSession(cookies(), sessionOptions) as Promise<AdminSession>;
}
