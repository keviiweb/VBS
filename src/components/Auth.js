import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { currentSession } from "@constants/helper";
import Layout from "../layout";
import Loading from "./Loading";

const Auth = ({ children, admin }) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const hasUser = !!session?.user;
  const router = useRouter();
  const devSession = currentSession();

  useEffect(() => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
      if (admin && !devSession.user.admin) {
        router.push("/unauthorized");
      }
    } else {
      if (!loading && !hasUser) {
        router.push("/signin");
      } else if (admin && !session.user.admin) {
        router.push("/unauthorized");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasUser]);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    return <Layout>{children}</Layout>;
  } else if (loading || !hasUser) {
    return <Loading />;
  }

  return <Layout>{children}</Layout>;
};

export default Auth;
