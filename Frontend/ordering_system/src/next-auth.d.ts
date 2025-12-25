// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      token: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    token: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    token: string
    role: string
  }
}