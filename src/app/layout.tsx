import type { Metadata, Viewport } from "next";
import "./globals.css";
import StoreProvider from "./providers/StoreProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import SessionWrapper from "./providers/SessionWrapper";
import React, { Suspense, useEffect } from "react";
import AuthProvider from "./providers/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import TopLoaderProvider from "./providers/TopLoaderProvider";
import { initLogger } from "../logger";
import ClientTrackersProvider from "./providers/ClientTrackersProvider";
import Loading from "../components/ui/loading";

const APP_NAME = "Hook Generator";
const APP_DEFAULT_TITLE = "HookGen";
const APP_TITLE_TEMPLATE = "%s - HookGen";
const APP_DESCRIPTION = "Build your SaaS easily!";

interface RootLayoutProps {
  children: React.ReactNode;
  locale: never;
}

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export default function Layout({ children }: RootLayoutProps) {
  initLogger();

  return (
    <html lang="en" className="font-montserrat">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#00000000" />
        <meta property="og:image" content="<generated>" />
        <meta property="og:image:type" content="<generated>" />
        <meta property="og:image:width" content="<generated>" />
        <meta property="og:image:height" content="<generated>" />
      </head>
      <body>
        <Suspense
          fallback={
            <Loading spinnerClassName="absolute top-1/2 left-1/2 h-10 w-10" />
          }
        >
          <StoreProvider>
            <SessionWrapper>
              <ThemeProvider>
                <AuthProvider>
                  <TopLoaderProvider />
                  {children}
                  <ClientTrackersProvider />
                  <SpeedInsights />
                  <Analytics />
                </AuthProvider>
              </ThemeProvider>
            </SessionWrapper>
          </StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
