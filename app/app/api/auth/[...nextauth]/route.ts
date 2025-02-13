import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { prismaClient } from "@/app/lib/db";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ],
    secret: process.env.NEXTAUTH_SECRET ?? "secret",
    callbacks: {
        async signIn(params) {
            if (!params.user.email) {
                return false; // Prevent sign-in if email is not available
            }

            try {
                await prismaClient.user.create({
                    data: {
                        email: params.user.email,
                        provider: "Google" // Store the provider information
                    }
                });
            } catch (e) {
                // Handle any errors that occur during the user creation
            }
            return true; // Allow sign-in if everything is successful
        }
    }
});

export { handler as GET, handler as POST };