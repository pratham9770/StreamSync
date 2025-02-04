import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"; // For schema validation
import { prismaClient } from "@/app/lib/db";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/app/lib/utils";



const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
});

export async function POST(req: NextRequest) {
    try {
        const data = CreateStreamSchema.parse(await req.json());

        // Validate the YouTube URL
        const isYtUrl =data.url.match(YT_REGEX);
        if (!isYtUrl) {
            return NextResponse.json(
                { message: "Invalid YouTube URL" },
                { status: 400 }
            );
        }

        // Validate if the user exists
        const userExists = await prismaClient.user.findUnique({
            where: { id: data.creatorId },
        });
        if (!userExists) {
            return NextResponse.json(
                { message: "Creator not found" },
                { status: 404 }
            );
        }

        // Extract YouTube video ID
        const extractedId = data.url.split("?v=")[1];
        const res=youtubesearchapi.GetVideoDetails(extractedId);
        const thumbnails=res.thumbnail.thumbnails;
        thumbnails.sort((a:{width:number},b:{width:number})=>(a.width-b.width)?-1:1);

        // Save the stream in the database
        const stream=await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: "Youtube", // Matches the enum in the schema
                upvotes: 0, // Initial upvotes set to 0
                title:res.title??"Couldn't fetch title",
                smallImg:(thumbnails.length>1?thumbnails[thumbnails.length-2].url:thumbnails[thumbnails.length-1].url)??"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vecteezy.com%2Ffree-photos%2Fbeautiful-flowers&psig=AOvVaw3UViw_w63TndtgcfLKMmTg&ust=1738669277578000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJjfp_i1p4sDFQAAAAAdAAAAABAE",
                bigImg:thumbnails[thumbnails.length-1].url??"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vecteezy.com%2Ffree-photos%2Fbeautiful-flowers&psig=AOvVaw3UViw_w63TndtgcfLKMmTg&ust=1738669277578000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJjfp_i1p4sDFQAAAAAdAAAAABAE",
            },
        });

        // Success response
        return NextResponse.json(
            { message: "Stream added successfully",
                id:stream.id
             },
            { status: 201 }
        );
    } catch (e) {
        console.error("Error while adding a stream:", e);
        return NextResponse.json(
            { message: "Error while adding a stream" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest){
const creatorId=req.nextUrl.searchParams.get("creatorId");
if(!creatorId){
    return NextResponse.json({
        message:"CreatorId not found"
    },{
        status:411
    })
}
const streams=await prismaClient.stream.findMany({
    where:{
        userId:creatorId
    },
    include:{
        _count:{
            select:{
                upvoters:true
            }
        },
        upvoters:{
            where:{
                userId:creatorId
            }
        }
    }
})
return NextResponse.json({streams});

}

    
