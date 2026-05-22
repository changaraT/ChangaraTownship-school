import { useEffect } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import "../src/index.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {
        // Service worker registration is optional for local development.
      });
    }

    fetch('/api/health').catch(() => {
      // Keep-alive ping is best effort and should not block app load.
    });
  }, []);

  return (
    <>
      <Head>
        <meta name="application-name" content="Changara School System" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
