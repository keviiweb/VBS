import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "../layout";
import Loading from "./Loading";

const Auth = ({ children }) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const hasUser = !!session?.user;
  const router = useRouter();
  useEffect(() => {
    if (!loading && !hasUser) {
      router.push("/signin");
    }
  }, [loading, hasUser]);
  
  if (loading || !hasUser) {
    return <Loading />
  }
  return (
    <Layout>
      {children}
    </Layout>
  );
};

export default Auth;