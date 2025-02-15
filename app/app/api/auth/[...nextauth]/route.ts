import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { prismaClient } from "@/app/lib/db";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: "213628529192-98676940lru6v4ni9i86k6jbsekcrfme.apps.googleusercontent.com",





            clientSecret: "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"
        })
    ],
    secret: "heykikidoyouloveme" ,
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
                console.log(e);                // Handle any errors that occur during the user creation
            }
            return true; // Allow sign-in if everything is successful
        }
    }
});

export { handler as GET, handler as POST };
