import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db"; 
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // THE FIX: This forces Google to show the account selection screen 
      // instead of auto-logging you in with your previous session.
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        isAdminLogin: { label: "Admin Login", type: "text" } 
      },
      async authorize(credentials) {
        if (credentials?.isAdminLogin === "true") {
          if (credentials.password === process.env.MASTER_ADMIN_PASSWORD) {
            const masterEmail = process.env.MASTER_ADMIN_EMAIL!;
            let adminUser = await db.user.findUnique({ where: { email: masterEmail } });
            
            if (!adminUser) {
              adminUser = await db.user.create({ data: { email: masterEmail, name: "Admin", rank: 100, level: 100 } });
            } else if (adminUser.name !== "Admin" || adminUser.level !== 100) {
              adminUser = await db.user.update({ where: { email: masterEmail }, data: { name: "Admin", level: 100 } });
            }
            return adminUser;
          }
          throw new Error("Invalid Master Passcode");
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        if (credentials.email.toLowerCase() === process.env.MASTER_ADMIN_EMAIL?.toLowerCase()) {
            throw new Error("Classified Account: Please authenticate via the secure Admin Portal.");
        }

        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user?.hashedPassword) {
          throw new Error("Account connected via Google. Please Sign in with Google.");
        }

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isCorrectPassword) throw new Error("Invalid credentials");

        return user;
      }
    })
  ],
  pages: { signIn: '/login' },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
       if (account?.provider === "google") {
          const safeEmail = user.email || "";
          
          if (safeEmail.toLowerCase() === process.env.MASTER_ADMIN_EMAIL?.toLowerCase()) {
              const existingAdmin = await db.user.findUnique({ where: { email: safeEmail }});
              if (!existingAdmin) {
                  setTimeout(async () => {
                     await db.user.update({ where: { email: safeEmail }, data: { name: "Admin", rank: 100, level: 100 }});
                  }, 2000);
              } else if (existingAdmin.name !== "Admin" || existingAdmin.level !== 100) {
                  await db.user.update({ where: { email: safeEmail }, data: { name: "Admin", level: 100 }});
              }
              user.name = "Admin";
          }
       }
       return true;
    },
    async jwt({ token, user }) {
      if (user) { 
        token.id = user.id; 
        token.level = (user as any).level || 1;
      }
      if (token.email?.toLowerCase() === process.env.MASTER_ADMIN_EMAIL?.toLowerCase()) { 
        token.name = "Admin"; 
        token.level = 100;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { 
         (session.user as any).id = token.id; 
         (session.user as any).level = token.level;
         if (session.user.email?.toLowerCase() === process.env.MASTER_ADMIN_EMAIL?.toLowerCase()) {
             session.user.name = "Admin";
             (session.user as any).level = 100;
         }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };