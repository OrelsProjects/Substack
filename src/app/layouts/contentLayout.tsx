"use client";

import React from "react";
import "../../../firebase.config";
import type { Viewport } from "next";

import AuthProvider from "../providers/AuthProvider";
import NotificationsProvider from "../providers/NotificationsProvider";
import TopLoaderProvider from "../providers/TopLoaderProvider";
import AnimationProvider from "../providers/AnimationProvider";
import HeightProvider from "../providers/HeightProvider";
import ContentProvider from "../providers/ContentProvider";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: RootLayoutProps) {
  return (
    <main>
      <AuthProvider>
        <NotificationsProvider />
        <HeightProvider>
          <ContentProvider>
            <TopLoaderProvider />
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
                vault: true, // Enable vault to store payment details
                // currency: "USD",
                // enableFunding: "card,ideal",
                // components: "googlepay,buttons",
              }}
            >
              <AnimationProvider>{children}</AnimationProvider>
            </PayPalScriptProvider>
          </ContentProvider>
        </HeightProvider>
      </AuthProvider>
    </main>
  );
}

export const viewport: Viewport = {
  themeColor: "#121212",
};
