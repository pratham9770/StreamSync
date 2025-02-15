import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import {  NextResponse } from "next/server";

export const GET = async () => {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      { status: 403 },
    );
  }

  // Fetch user details from the database
  const user = await prismaClient.user.findFirst({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
  });
};

export const dynamic = "force-dynamic";
