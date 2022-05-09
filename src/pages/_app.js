import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import Header from '../components/Header';
import '../styles/_global.css';
import Head from 'next/head';

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
        <title>KEVII VBS</title>
      </Head>
      <Header />
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}
