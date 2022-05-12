import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";
import "@styles/Calendar.css";
import { extendTheme } from "@chakra-ui/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const theme = extendTheme({
    components: {
      Radio: {
        // can be Radio
        baseStyle: {
          label: {
            touchAction: "none",
          },
        },
      },
    },
  });

  return (
    <SessionProvider
      session={session}
      refetchInterval={Number(process.env.NEXTAUTH_REFRESH_INTERVAL)}
    >
      <ChakraProvider theme={theme}>
        <Head>
          <title>KEVII VBS</title>
        </Head>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}
