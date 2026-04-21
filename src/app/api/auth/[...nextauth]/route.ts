import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db"; 
import bcrypt from "bcrypt";
import { cookies } from "next/headers"; // <-- Import cookies

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        isAdminLogin: { label: "Admin Login", type: "text" } 
      },
      async authorize(credentials) {
        // --- ADMIN PASSCODE LOGIC ---
        if (credentials?.isAdminLogin === "true") {
          if (credentials.password === process.env.MASTER_ADMIN_PASSWORD) {
            const masterEmail = process.env.MASTER_ADMIN_EMAIL!;
            let adminUser = await db.user.findUnique({ where: { email: masterEmail } });
            
            if (!adminUser) {
              adminUser = await db.user.create({ data: { email: masterEmail, name: "Admin", rank: 100 } });
            } else if (adminUser.name !== "Admin") {
              adminUser = await db.user.update({ where: { email: masterEmail }, data: { name: "Admin" } });
            }
            return adminUser;
          }
          throw new Error("Invalid Master Passcode");
        }

        // --- REGULAR USER LOGIC ---
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

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      }
    })
  ],
  pages: { signIn: '/login' },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
       // --- THE GOOGLE IRON CURTAIN ---
       if (account?.provider === "google") {
          if (user.email === process.env.MASTER_ADMIN_EMAIL) {
              // Check if the request came from the Admin login page
              const cookieStore = await cookies();
              const isAdminAttempt = cookieStore.get("admin_attempt")?.value === "true";

              if (!isAdminAttempt) {
                  // BLOCKS Master Email from logging in via the User Side Google button
                  throw new Error("Classified Account: Access denied from public portal.");
              }

              // Auto-create and force DB name to "Admin"
              const existingAdmin = await db.user.findUnique({ where: { email: user.email }});
              if (!existingAdmin) {
                  setTimeout(async () => {
                     await db.user.update({ where: { email: user.email! }, data: { name: "Admin", rank: 100 }});
                  }, 2000);
              } else if (existingAdmin.name !== "Admin") {
                 await db.user.update({ where: { email: user.email }, data: { name: "Admin" }});
              }
              user.name = "Admin";
          }
       }
       return true;
    },
    async jwt({ token, user }) {
      if (user) { token.id = user.id; }
      if (token.email === process.env.MASTER_ADMIN_EMAIL) { token.name = "Admin"; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { 
         (session.user as any).id = token.id; 
         if (session.user.email === process.env.MASTER_ADMIN_EMAIL) {
             session.user.name = "Admin";
         }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };