import { ReferralOptions } from "global";
import { Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import prisma from "../app/api/_db/db";
import { generateReferalCode } from "../app/api/_utils/referralCode";
import loggerServer from "../loggerServer";
import { cookies } from "next/headers";

const getReferralOptions = (): ReferralOptions => {
  const referralCode = cookies().get("referralCode")?.value;
  return {
    referralCode,
  };
};

const clearReferralCode = () => {
  cookies().set("referralCode", "", {
    expires: new Date(0),
  });
};

export const getSession = async ({
  session,
  token,
  user,
}: {
  session: Session;
  token: JWT;
  user: AdapterUser;
}) => {
  let userInDB = await prisma.appUser.findFirst({
    where: {
      userId: token.sub,
    },
    include: {
      meta: true,
      settings: true,
    },
  });

  if (session?.user) {
    if (session?.user.image !== userInDB?.photoURL) {
      await prisma.appUser.update({
        where: {
          userId: token.sub,
        },
        data: {
          photoURL: session.user.image,
        },
      });
    }

    if (!session.user.meta) {
      session.user.meta = {
        referralCode: "",
        pushToken: "",
      };
    }
    session.user.userId = token.sub!;
    session.user.meta = {
      referralCode: userInDB?.meta?.referralCode || "",
    };
    session.user.settings = userInDB?.settings || {
      showNotifications: true,
    };
  }

  if (!session.user.meta.referralCode) {
    try {
      const referralCode = generateReferalCode(session.user.userId);
      await prisma.appUserMetadata.update({
        where: {
          userId: token.sub,
        },
        data: {
          referralCode,
        },
      });
      session.user.meta.referralCode = referralCode;
    } catch (e: any) {
      loggerServer.error("Error updating referral code", session.user.userId, {
        error: e,
      });
    }
  }
  return session;
};

export const signIn = async (session: any) => {
  try {
    let additionalUserData = {};
    let userInDB = await prisma.appUser.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        meta: true,
      },
    });

    if (!userInDB) {
      const referralOptions: ReferralOptions = getReferralOptions();
      const newUser = await prisma.appUser.create({
        data: {
          userId: session.user.id,
          email: session.user.email || "",
          photoURL: session.user.image || "",
          displayName: session.user.name || "",
          meta: {
            create: {
              referredBy: referralOptions.referralCode,
              referralCode: generateReferalCode(session.user.id),
            },
          },
          settings: {
            create: {
              showNotifications: true,
            },
          },
        },
      });
      additionalUserData = { ...newUser };
    }

    return {
      ...session,
      ...additionalUserData,
    };
  } catch (e: any) {
    loggerServer.error("Error signing in", session.user.id, { error: e });
  }
};
