import { prismaClient } from "@/app/lib/db";
import { Provider } from "@prisma/client";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async signIn(params){
            if(!params.user.email){
                return false;
            }
            try{
                await prismaClient.user.create({
                    data:{
                        email:params.user.email,
                       provider:"Google"
                    }

                });

            }
            catch(e){
                console.log(e);

            }
            
            return true;
        }
    }
});

// Export named functions for HTTP methods
export const GET = handler;
export const POST = handler;
