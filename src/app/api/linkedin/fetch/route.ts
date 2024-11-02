import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/authOptions";
import loggerServer from "@/loggerServer";
import scrapeSubstackData from "@/app/api/_utils/substack";
import { processNotes } from "../../_utils/llm";
import { SubstackNoteRecommendationWithNote } from "@/models/substackNote";
import prisma from "../../_db/db";
import { initLinkedInLogin } from "../../_utils/linkedin";

export async function GET(
  req: NextRequest,
  { params }: { params: { handler: string } },
): Promise<NextResponse<any[] | { error: string }>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // const username = "bookwormapp2@gmail.com";
    // const password = "002200oO";
    const username = "orelzilberman@gmail.com";
    const password = "RzQtWz8xVda74#F";

    const rec = await initLinkedInLogin(username, password);

    return NextResponse.json(rec, { status: 200 });
  } catch (error: any) {
    loggerServer.error("Error fetching notes", session.user.userId, {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
