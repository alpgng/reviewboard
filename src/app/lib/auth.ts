import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma"; // Ortak Prisma istemcisini kullan

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
  session: { 
    strategy: "jwt", // "database" yerine "jwt" kullanın
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Userıcı bilgilerini token'a ekle
      if (user) {
        token.userId = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Token'daki bilgileri session'a ekle
      if (session.user) {
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV !== "production", // Sadece geliştirme ortamında hata ayıklama modu etkinleştir
};