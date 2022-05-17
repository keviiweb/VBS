import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { currentSession } from "@constants/helper";
import Layout from "../layout";
import Loading from "./Loading";
import { fetchData } from "next-auth/client/_utils";

const Auth = ({ children, admin }) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const hasUser = !!session?.user;
  const router = useRouter();
  const devSession = useRef(null);

  useEffect(() => {
    async function fetchData() {
      devSession.current = await currentSession();
    
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
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    return <Layout>{children}</Layout>;
  } else if (loading || !hasUser) {
    return <Loading />;
  }

  return <Layout>{children}</Layout>;
};

export default Auth;
