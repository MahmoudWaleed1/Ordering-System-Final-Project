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

        // Logic to handle different backend response structures
        // It checks if 'user' is nested or if the data itself is the user
        const user = res.data.user || res.data;
        const token = res.data.token;

        if (!user) {
          return null;
        }

        return {
          id: user._id ?? user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role ?? "user",
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