import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/authOptions";
import loggerServer from "@/loggerServer";
import scrapeSubstackData from "@/app/api/_utils/substack";
import { processNotes } from "../../_utils/llm";
import { SubstackNoteRecommendationWithNote } from "@/models/substackNote";
import prisma from "../../_db/db";
import { initLinkedInLogin, PostsNoId } from "../../_utils/linkedin";
import linkedInPosts from "@/noah.json"

export async function GET(
  req: NextRequest,
  { params }: { params: { handler: string } },
): Promise<NextResponse<any[] | { error: string }>> {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  try {
    const username = process.env.LINKEDIN_USERNAME as string;
    const password = process.env.LINKEDIN_PASSWORD as string;

    const linkedInPosts: PostsNoId[] = await initLinkedInLogin(
      username,
      password,
      "alexhormozi",
    );

    // clear posts with empty content and duplicated content
    const linkedInPostsFiltered = linkedInPosts.filter(
      (post, index, self) => post.content.trim() !== "",
    );

    await prisma.linkedInPosts.createMany({
      data: linkedInPostsFiltered,
    });

    // const linkedInPostsFiltered = await prisma.linkedInPosts.findMany({
    //   where: {
    //     url: "https://www.linkedin.com/in/orel-zilberman-225a37137/recent-activity/all/",
    //   },
    // });
    // linkedInPostsFiltered.map(it => ({
    //   likes: it.likes,
    //   reposts: it.reposts,
    //   image: it.image,
    // }));

    // const linkedInPostsFiltered = await prisma.linkedInPosts.findMany({
    //   where: {
    //     AND: [
    //       {
    //         url: "https://www.linkedin.com/in/orel-zilberman-225a37137/recent-activity/all/",
    //       },
    //       {
    //         isRepost: false,
    //       },
    //     ],
    //   },
    //   select: {
    //     content: true,
    //     comments: true,
    //     likes: true,
    //     reposts: true,
    //   },
    //   take: 100,
    // });

    return NextResponse.json(linkedInPostsFiltered, { status: 200 });
  } catch (error: any) {
    // loggerServer.error("Error fetching notes", session.user.userId, {
    //   error,
    // });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
