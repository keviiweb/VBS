import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { currentSession } from "@constants/helper";
import Layout from "../layout";
import Loading from "./Loading";

const Auth = ({ children, admin }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const hasUser = !!session?.user;
  const redirect = useRef(false);

  useEffect(() => {
    if (!loading && !hasUser) {
      redirect.current = true;
    }
  }, [loading, hasUser]);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    const devSession = currentSession();
    if (admin && !devSession.user.admin) {
      router.push("/unauthorized");
    }

    return <Layout>{children}</Layout>;
  } else {
    if (redirect.current) {
      router.push("/signin");
    }
  
    if (loading || !hasUser) {
      return <Loading />;
    }
  
    if (admin && !session.user.admin) {
      router.push("/unauthorized");
    }
  
    return <Layout>{children}</Layout>;
  }
};

export default Auth;
