import NextAuth, { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("--- Authorize function called ---");
                console.log("Credentials received:", credentials);

                if (!credentials?.email || !credentials?.password) {
                    // console.log("Missing email or password.");
                    return null;
                }
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    // console.log(`User not found for email: ${credentials.email}`);
                    return null;
                }
                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isPasswordCorrect) {
                    // console.log("Password comparison failed.");
                    return null;
                }
                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt" as SessionStrategy,
    },
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
