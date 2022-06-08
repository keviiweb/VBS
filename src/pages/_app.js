import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";

import "@styles/sys/Calendar.css";
import "@styles/landing/styles.css";

import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import "@fullcalendar/list/main.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={Number(process.env.NEXTAUTH_REFRESH_INTERVAL)}
    >
      <ChakraProvider>
        <Head>
          <title>KEVII</title>
        </Head>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}
