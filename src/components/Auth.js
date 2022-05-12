import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "../layout";
import Loading from "./Loading";

const Auth = ({ children }) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const hasUser = !!session?.user;
  const router = useRouter();
  const redirect = useRef(false);

  useEffect(() => {
    if (!loading && !hasUser) {
      redirect.current = true;
    }
  }, [loading, hasUser, router]);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    return <Layout>{children}</Layout>;
  }

  if (redirect.current) {
    router.push("/signin");
  }

  if (loading || !hasUser) {
    return <Loading />;
  }
  return <Layout>{children}</Layout>;
};

export default Auth;
