import { NextRequest, NextResponse } from "next/server";
import Logger from "../../../loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/authOptions";
import { createOrder } from "../_utils/payments";
import prisma from "../_db/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { cart }: { cart: { itemId: string; amount: string } } =
      await req.json();

    const item = await prisma.cartItems.findFirst({
      where: {
        id: cart.itemId,
      },
    });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const value = item.price * parseInt(cart.amount);

    if (value <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await createOrder({
      currency: item.currency,
      value,
    });

    return NextResponse.json(order, { status: 200 });
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
