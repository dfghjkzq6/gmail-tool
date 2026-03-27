import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://mail.google.com/",
          access_type: "offline",
          prompt: "select_account consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        
        // Store user in Neon database
        if (user) {
          try {
            await db.upsert({
              id: user.id,
              name: user.name,
              email: user.email,
              accessToken: account.access_token,
              refreshToken: account.refresh_token
            });
          } catch (error) {
            console.error('Failed to store user in database:', error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      
      // Add user ID from database if needed
      if (token.email) {
        try {
          const dbUser = await db.findByEmail(token.email);
          if (dbUser) {
            session.user.id = dbUser.id;
          }
        } catch (error) {
          console.error('Failed to fetch user from database:', error);
        }
      }
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
