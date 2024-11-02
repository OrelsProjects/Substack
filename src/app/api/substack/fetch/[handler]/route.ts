import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/authOptions";
import loggerServer from "@/loggerServer";
import scrapeSubstackData from "@/app/api/_utils/substack";
import { processNotes } from "../../../_utils/llm";
import { SubstackNoteRecommendationWithNote } from "@/models/substackNote";
import prisma from "../../../_db/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { handler: string } },
): Promise<
  NextResponse<SubstackNoteRecommendationWithNote[] | { error: string }>
> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // const userRecommendations = await prisma.recommendations.findMany({
    //   where: {
    //     userId: session.user.userId,
    //   },
    //   include: {
    //     userNote: true,
    //   },
    // });

    // if (userRecommendations.length > 0) {
    //   return NextResponse.json(userRecommendations, { status: 200 });
    // }

    let userNotes: any[] = [];
    // await prisma.userNotes.findMany({
    //   where: {
    //     userId: session.user.userId,
    //   },
    // });

    if (userNotes.length === 0) {
      const scrapedNotes = await scrapeSubstackData(params.handler, "all");
      userNotes = scrapedNotes.map(note => ({
        ...note,
        userId: session.user.userId,
      }));

      const userNotesNoId = userNotes.map(note => {
        const { id, ...rest } = note;
        return rest;
      });

      await prisma.userNotes.createMany({
        data: userNotesNoId,
      });

      userNotes = await prisma.userNotes.findMany({
        where: {
          userId: session.user.userId,
        },
      });
    }

    const response = await processNotes(userNotes);

    const recommendations = response.map(recommendation => ({
      ...recommendation,
      handler: params.handler,
    }));

    await prisma.recommendations.createMany({
      data: recommendations.map(recommendation => ({
        ...recommendation,
        userId: session.user.userId,
      })),
    });

    const recommendationsWithNotes = recommendations.map(recommendation => ({
      ...recommendation,
      userNote:
        userNotes.find(note => note.id === recommendation.inspiredBy) || null,
    }));

    return NextResponse.json(recommendationsWithNotes, { status: 200 });
  } catch (error: any) {
    loggerServer.error("Error fetching notes", session.user.userId, {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
