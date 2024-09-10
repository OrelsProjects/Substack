import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/authOptions";
import loggerServer from "@/loggerServer";
import scrapeSubstackData from "@/app/api/_utils/substack";
import { processNotes } from "../../../_utils/llm";

export async function GET(
  req: NextRequest,
  { params }: { params: { handler: string } },
): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const notes = await scrapeSubstackData(params.handler);
    const response = await processNotes(notes);
    return NextResponse.json({ response }, { status: 200 });
  } catch (error: any) {
    // loggerServer.error("Error initializing logger", session.user.userId, {
    //   error,
    // });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
