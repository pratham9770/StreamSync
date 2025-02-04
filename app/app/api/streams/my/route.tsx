import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? "",
        },
    });

    if (!user) {
        return NextResponse.json(
            {
                message: "User not found",
            },
            {
                status: 403,
            }
        );
    }

    const streams = await prismaClient.stream.findMany({
        where: {
            userId: user.id,
        },
        include: {
            _count: {
                select: {
                    upvoters: true, // Count the number of related Upvote records
                },
            },
            upvoters:{
                where:{
                    userId:user.id
                }
            }
        },
    });

    return NextResponse.json({
        streams: streams.map(({ _count, ...rest }) => ({
            ...rest,
            upvotesCount: _count.upvoters || 0, 
            haveUpvote:rest.upvoters.length?true:false// Safely access the count of upvoters
        })),
    });
}
