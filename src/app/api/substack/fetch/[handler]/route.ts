import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/authOptions";
import loggerServer from "@/loggerServer";
import scrapeSubstackData from "@/app/api/_utils/substack";
import { processNotes } from "../../../_utils/llm";
import {
  RecommendationNoHandlerContentMatrix,
  SubstackNoteRecommendationWithNote,
} from "@/models/substackNote";
import prisma from "../../../_db/db";
import { Recommendations, UserNotes } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { handler: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const userRecommendations = await prisma.recommendations.findMany({
      where: {
        userId: session.user.userId,
      },
      include: {
        userNote: true,
      },
    });

    if (userRecommendations.length > 0) {
      return NextResponse.json(userRecommendations, { status: 200 });
    }

    let userNotes: UserNotes[] = await prisma.userNotes.findMany({
      where: {
        userId: session.user.userId,
      },
    });

    if (userNotes.length === 0) {
      const scrapedNotes = await scrapeSubstackData(params.handler, "all");
      const newUserNotes = scrapedNotes.map(note => ({
        ...note,
        userId: session.user.userId,
      }));

      const userNotesNoId = newUserNotes.map(note => {
        const { id, ...rest } = note;
        return rest;
      });

      await prisma.userNotes.createMany({
        data: userNotesNoId.map(note => ({
          ...note,
          userId: session.user.userId,
        })),
      });

      userNotes = await prisma.userNotes.findMany({
        where: {
          userId: session.user.userId,
        },
      });
    }

    if (userNotes.length === 0) {
      return NextResponse.json({ error: "No notes found" }, { status: 404 });
    }

    let response = (await processNotes(
      userNotes,
      "content-matrix",
    )) as RecommendationNoHandlerContentMatrix[];

    const recommendationsWithoutInspiredBy = response.filter(recommendation =>
      userNotes.map(it => it.id).includes(recommendation.inspiredBy || ""),
    );

    const recommendations: Omit<Recommendations, "id">[] = response.map(
      recommendation => ({
        userId: session.user.userId,
        idea: recommendation.idea,
        hook: recommendation.hook,
        content: recommendation.content,
        rating: recommendation.rating,
        structure: recommendation.structure.name,
        topic: recommendation.topic as string,
        inspiredBy: recommendation.inspiredBy || null,
        handler: params.handler,
      }),
    );

    await prisma.recommendations.createMany({
      data: recommendations,
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
