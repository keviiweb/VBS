import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

import "./index.css";

const Index = (_props) => {
  const { data: session } = useSession();

  if (session) {
    return (
      <React.Fragment>
        <div className="homeContainer">
          <div className="ctaContainer">
          <button onClick={() => signOut()}>Sign out</button>
            <text className="title">
              By KEVIIANS,
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; For KEVIIANS
            </text>
            <a href="/vbs" className="cta">
              Try Our Venue Booking System
            </a>
          </div>
        </div>
      </React.Fragment>
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

export default Home;

