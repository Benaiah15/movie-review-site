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
      allowDangerousEmailAccountLinking: true, 
      authorization: { params: { prompt: "select_account" } },
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
              // Ensure created Master Admins get the ADMIN role
              adminUser = await db.user.create({ data: { email: masterEmail, name: "Admin", rank: 100, level: 100, role: "ADMIN" } });
            } else if (adminUser.role !== "ADMIN") {
              // Self-heal: If the master email doesn't have the role, give it to them
              adminUser = await db.user.update({ where: { email: masterEmail }, data: { role: "ADMIN" } });
            }
            return adminUser;
          }
          throw new Error("Invalid Master Passcode");
        }

        if (!credentials?.email || !credentials?.password) throw new Error("Invalid credentials");
        
        if (credentials.email.trim().toLowerCase() === process.env.MASTER_ADMIN_EMAIL?.trim().toLowerCase()) {
            throw new Error("Classified Account: Please authenticate via the secure Admin Portal.");
        }

        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user?.hashedPassword) throw new Error("Account connected via Google. Please Sign in with Google.");

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isCorrectPassword) throw new Error("Invalid credentials");

        return user;
      }
    })
  ],
  pages: { signIn: '/login' },
  session: { strategy: "jwt" },
  callbacks: {
    // We use NextAuth's native token pipeline to enforce the Role from the DB securely
    async jwt({ token, user }) {
      if (user) { 
        token.id = user.id; 
        token.level = (user as any).level || 1;
        token.role = (user as any).role || "USER";
      }
      
      const safeEmail = token.email || "";
      const isMasterAdmin = safeEmail.trim().toLowerCase() === process.env.MASTER_ADMIN_EMAIL?.trim().toLowerCase();
      
      if (isMasterAdmin) { 
        token.name = "Admin"; 
        token.level = 100;
        token.role = "ADMIN";
        token.isAdmin = true;
        
        // Silently correct the database in the background if Google overwrote the name or missing role
        db.user.updateMany({
           where: { email: safeEmail },
           data: { name: "Admin", rank: 100, level: 100, role: "ADMIN" }
        }).catch(()=>null);
      } else {
        token.isAdmin = token.role === "ADMIN";
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) { 
         (session.user as any).id = token.id; 
         (session.user as any).level = token.level;
         (session.user as any).role = token.role;
         (session.user as any).isAdmin = token.isAdmin;

         if (token.isAdmin) {
             session.user.name = "Admin";
         }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };