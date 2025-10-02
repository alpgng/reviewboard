import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Kimlik doğrulama başladı", { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Kimlik bilgileri eksik");
          return null;
        }

        try {
          // Userıcıyı bul
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              accounts: {
                where: {
                  provider: "credentials"
                }
              }
            }
          });

          console.log("Kullanıcı bulundu mu?", !!user);
          console.log("Hesaplar:", user?.accounts?.length || 0);

          if (!user || !user.accounts || user.accounts.length === 0) {
            console.log("Kullanıcı veya hesapları bulunamadı");
            return null;
          }

          const account = user.accounts[0];
          const storedPassword = account.id_token;

          console.log("Şifre var mı?", !!storedPassword);

          if (!storedPassword) {
            console.log("Kayıtlı şifre bulunamadı");
            return null;
          }

          // Şifre karşılaştırma
          const isPasswordValid = await bcrypt.compare(
            credentials.password, 
            storedPassword
          );

          console.log("Şifre geçerli mi?", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Şifre geçersiz");
            return null;
          }

          console.log("Kimlik doğrulama başarılı");
          return user;
        } catch (error) {
          console.error("Kimlik doğrulama hatası:", error);
          return null;
        }
      }
    }),
  ],
  session: { strategy: "database" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user?.id) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
  debug: true, // Hata ayıklama modunu etkinleştir
};