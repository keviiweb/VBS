import { useSession, signIn, signOut } from "next-auth/react";

const Index = (_props) => {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
      Signed in as {session.user.email} <br />
      Hello {session.user.studentID} <br />
      Hello {session.user.username} <br />
      <button onClick={() => signOut()}>Sign out</button>
    </>
    );
  } else {
    return (
      <>
        Not signed in <br />
        <button onClick={() => signIn()}>Sign in</button>
      </>
    );
  }
 
};

export default Index;

