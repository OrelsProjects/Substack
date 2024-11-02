import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/authOptions";
import loggerServer from "@/loggerServer";
import scrapeSubstackData from "@/app/api/_utils/substack";
import prisma from "../../../_db/db";

const isInited = async (userId: string) => {
  // if user has notes, they are already initialized
  const userNotes = await prisma.userNotes.findMany({
    where: {
      userId,
    },
  });
  return userNotes.length > 0;
};

export async function POST(
  req: NextRequest,
  { params }: { params: { handler: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const isInitialized = await isInited(session.user.userId);
    if (isInitialized) {
      return NextResponse.json({}, { status: 200 });
    }
    const notes = await scrapeSubstackData(params.handler, "all");
    const notesWithoutId = notes.map(note => {
      const { id, ...rest } = note;
      return rest;
    });

    await prisma.userNotes.createMany({
      data: notesWithoutId.map(note => ({
        ...note,
        userId: session.user.userId,
      })),
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    loggerServer.error("Error initializing user", session.user.userId, {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
