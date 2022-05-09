import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import Head from 'next/head';
import Layout from "@layout/index";

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
         <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </SessionProvider>
  );
}
