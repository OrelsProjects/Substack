import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";
import { getSubscriptionPlan } from "@/app/api/_utils/payments";

export async function GET(
  req: NextRequest,
  { params }: { params: { planId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const subscriptionPlans = await getSubscriptionPlan(params.planId);
    return NextResponse.json(subscriptionPlans, { status: 200 });
  } catch (error) {
    Logger.error("Error sending notification", session.user.userId, {
      data: { error },
    });
    return NextResponse.json(
      { error: "Error sending notification" },
      { status: 500 },
    );
  }
}
