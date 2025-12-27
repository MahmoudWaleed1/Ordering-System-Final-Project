import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiService } from "@/services/api";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const res = await apiService.login(
          credentials.username,
          credentials.password
        );

        // If the backend returned an error status, fail the auth
        if (!res.ok || !res.data) {
          console.error("Login failed at backend:", res.status);
          return null;
        }

        // Backend returns: { access_token: string, role: string }
        const token = res.data.access_token;
        const role = res.data.role;

        if (!token) {
          return null;
        }

        // Get user profile to get full user info
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/users/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        let userData: any = {};
        if (profileRes.ok) {
          userData = await profileRes.json();
        }

        return {
          id: userData.username || credentials.username,
          name: userData.first_name && userData.last_name 
            ? `${userData.first_name} ${userData.last_name}` 
            : credentials.username,
          email: userData.email || "",
          username: userData.username || credentials.username,
          role: role || userData.role || "Customer",
          token: token, // This passes the token to the JWT callback
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = (user as any).token;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).token = token.token as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/authentication/login",
  },

  secret: process.env.AUTH_SECRET,
});

export { handler as GET, handler as POST };