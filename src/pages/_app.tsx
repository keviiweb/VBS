import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';

import '@styles/sys/Calendar.css';
import '@styles/landing/styles.css';

import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';

/**
 * Main entry point of the entire application.
 *
 * Used to import CSS styles as this is the only valid place for that
 *
 * @param param0 React components
 * @returns The entire app
 */
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <ChakraProvider>
      <SessionProvider
        session={session}
        refetchInterval={Number(process.env.NEXTAUTH_REFRESH_INTERVAL)}
      >
        <Head>
          <title>KEVII</title>
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </ChakraProvider>
  );
}
