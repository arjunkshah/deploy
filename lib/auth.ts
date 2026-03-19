import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { verifyUser } from "@/lib/users";

const hasGoogleProvider = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const authSecret =
  process.env.NEXTAUTH_SECRET?.trim() ||
  process.env.AUTH_SECRET?.trim() ||
  process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
  process.env.VERCEL_URL?.trim() ||
  "deploydotcom-dev-secret";

process.env.NEXTAUTH_SECRET = authSecret;

const fallbackUrl =
  process.env.NEXTAUTH_URL?.trim() ||
  process.env.NEXTAUTH_URL_INTERNAL?.trim() ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
  process.env.VERCEL_URL?.trim() ||
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://deploydotcom.vercel.app";
const normalizedUrl = fallbackUrl.startsWith("http") ? fallbackUrl : `https://${fallbackUrl}`;

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = normalizedUrl;
}

if (!process.env.NEXTAUTH_URL_INTERNAL) {
  process.env.NEXTAUTH_URL_INTERNAL = process.env.NEXTAUTH_URL;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email?.toLowerCase().trim();
          const password = credentials?.password ?? "";
          if (!email || !password) return null;
          const user = await verifyUser(email, password);
          if (!user) return null;
          return { id: user.id, email: user.email };
        } catch (error) {
          console.error("Auth verification failed", error);
          return null;
        }
      }
    }),
    ...(hasGoogleProvider
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
          })
        ]
      : [])
  ],
  session: {
    strategy: "jwt"
  },
  logger: {
    error(code, metadata) {
      console.error("NextAuth error", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth warning", code);
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login"
  }
};

export async function getAuthSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("getAuthSession failed", error);
    return null;
  }
}
