/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectAuth,
  setUser as setUserAction,
} from "../../lib/features/auth/authSlice";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import { setUserEventTracker } from "../../eventTracker";
import { setUserLogger } from "../../logger";
import { useSession } from "next-auth/react";
import AppUser from "../../models/appUser";
import { useAppDispatch } from "../../lib/hooks/redux";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useSelector(selectAuth);
  const { data: session, status } = useSession();

  const setUser = async (user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userId?: string | null;
    role?: string | null;
    meta: {
      referralCode?: string | null;
    };
  }) => {
    try {
      const appUser: AppUser = {
        displayName: user?.name || null,
        email: user?.email || "",
        photoURL: user?.image || null,
        userId: user?.userId || "",
        // role: user?.role || "",
        settings: {
          showNotifications: true,
        },
        meta: {
          referralCode: user?.meta.referralCode || "",
        },
      };
      dispatch(setUserAction(appUser));
    } catch (error: any) {
      console.error(error);
      dispatch(setUserAction(null));
    }
  };

  useEffect(() => {
    switch (status) {
      case "authenticated":
        setUser(session.user);

        break;
      case "loading":
        break;
      case "unauthenticated":
        setUser(undefined);
        break;
      default:
        break;
    }
  }, [status]);

  useEffect(() => {
    setUserEventTracker(currentUser);
    setUserLogger(currentUser);
  }, [currentUser]);

  useEffect(() => {
    console.log("status", status);
    console.log("pathname", pathname);
    if (status === "loading") return;
    if (status === "authenticated") {
      if (
        pathname.includes("login") ||
        pathname.includes("register") ||
        pathname === "/"
      ) {
        router.push("/home");
      }
    } else {
      if (
        !pathname.includes("/login") &&
        !pathname.includes("/register") &&
        pathname !== "/"
        && !pathname.includes("/privacy")
        && !pathname.includes("/tos")
      ) {
        // router.push("/login");
      }
    }
  }, [status]);
  if (status === "loading") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loading className="w-20 h-20" />
      </div>
    );
  }
  return children;
}
