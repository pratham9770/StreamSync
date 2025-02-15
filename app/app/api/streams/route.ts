import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"; // For schema validation
import { prismaClient } from "@/app/lib/db";
// @ts-expect-error: No type definitions available for youtube-search-api
import youtubesearchapi from "youtube-search-api";

import { YT_REGEX } from "@/app/lib/utils";
import { getServerSession } from "next-auth";



const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
});
const MAX_QUEUE_LEN=20;
export async function POST(req: NextRequest) {
    
    try {
        const bodyText = await req.text();
        if (!bodyText) {
            return NextResponse.json({ message: "Request body is empty" }, { status: 400 });
        }

        let parsedBody;
        try {
            parsedBody = JSON.parse(bodyText);
        } catch (error) {
            console.log(error);
            return NextResponse.json(
                { message: "Request body is not valid JSON" },
                { status: 400 }
            );
        }

        const data = CreateStreamSchema.parse(parsedBody);

        if (!data || typeof data !== "object") {
            throw new TypeError("Payload must be an object");
        }
       

        const { creatorId, url } = data;
        alert(creatorId}

        if (!creatorId || !url) {
            return NextResponse.json(
                { message: "Missing required fields: creatorId or url", receivedData: data },
                { status: 400 }
            );
        }
        const isYt = data.url.match(YT_REGEX);
        if (!isYt) {
            return NextResponse.json({
                message: "Wrong URL format"
            }, {
                status: 411
            });
        }

        const extractedId = data.url.split("?v=")[1];

        const res = await youtubesearchapi.GetVideoDetails(extractedId);

        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a: {width: number}, b: {width: number}) => a.width < b.width ? -1 : 1);

        const existingActiveStream = await prismaClient.stream.count({
            where: {
                userId: data.creatorId
            }
        });

        if (existingActiveStream > MAX_QUEUE_LEN) {
            return NextResponse.json({
                message: "Already at limit"
            }, {
                status: 411
            });
        }

        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                upvotes: 0,
                
                addedById: data.creatorId,
                url: data.url,
                extractedId,
                type: "Youtube",
                title: res.title ?? "Cant find video",
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? "<https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg>",
                bigImg: thumbnails[thumbnails.length - 1].url ?? "<https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg>"
            }
        });
        

        return NextResponse.json({
            ...stream,
            hasUpvoted: false,
            upvotes: 0,
            downvotes: 0
        },{ status: 201 });
    } catch (e:any) {
        console.error("Error while adding a stream:", e); // Improved logging
        return NextResponse.json({
            message: "Error while adding a stream oh my god what do we do",
            error: e.message || "Unknown error" // Include the error message for debugging
        }, { status: 500 });
    }
}



export async function GET(req: NextRequest){
const creatorId=req.nextUrl.searchParams.get("creatorId");
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
if(!creatorId){
    return NextResponse.json({
        message:"CreatorId not found"
    },{
        status:411
    })
}
const [streams,activeStream]=await Promise.all ([await prismaClient.stream.findMany({
    where:{
        userId:creatorId,
        played:false
    },
    include:{
        _count:{
            select:{
                upvoters:true
            }
        },
        upvoters:{
            where:{
                userId:user.id
            }
        }
    }
    }),prismaClient.currentStream.findFirst({
        where:{
            userId:creatorId
        },
        include:{
            stream:true
        }
}),
]);
return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
        ...rest,
        upvotes: _count.upvoters || 0, 
        haveUpvoted:rest.upvoters.length?true:false// Safely access the count of upvoters
    })),
    activeStream
});
}

    
