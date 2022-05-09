import { SessionProvider } from "next-auth/react"

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session} refetchInterval={Number(process.env.NEXTAUTH_REFRESH_INTERVAL)}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}