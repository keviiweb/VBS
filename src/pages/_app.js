import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";

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
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}
