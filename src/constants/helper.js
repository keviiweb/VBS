import { prisma } from "./db";
import { useSession } from "next-auth/react";

export const currentSession = () => {
  var session = null;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    session = {
      expires: "1",
      user: { name: "a", email: "Delta", admin: false },
    };
  } else {
    const { data: session, _status } = useSession();
    if (session) {
      return session;
    }
  }

  return session;
};

export const fetchVenue = async () => {
  const session = currentSession();

  if (session) {
    try {
      const locations = await prisma.venue.findMany({
        where: { visible: true, isChildVenue: false },
      });

      if (locations != null) {
        return { status: true, error: null, msg: locations };
      } else {
        return { status: true, error: null, msg: "" };
      }
    } catch (error) {
      console.log(error);
      return { status: false, error: "Connection timeout", msg: "" };
    }
  } else {
    return { status: false, error: "User must be authenticated", msg: "" };
  }
};
