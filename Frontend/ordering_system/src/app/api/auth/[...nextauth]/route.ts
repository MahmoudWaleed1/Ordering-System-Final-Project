import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiService } from "@/services/api";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const data = await apiService.login(credentials.email, credentials.password);

        if (data?.token && data?.user) {
          return {
            id: data.user._id || data.user.id,
            name: data.user.name,
            email: data.user.email,
            token: data.token,
            role: data.user.role || "user",
          };
        }

        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = user.token;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.token = token.token as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.AUTH_SECRET,
});

export { handler as GET, handler as POST };
