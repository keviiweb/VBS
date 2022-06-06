import { prisma } from "@constants/sys/db";

export const findCCAbyName = async (name) => {
  try {
    const query = await prisma.CCA.findUnique({
      where: {
        name: name,
      },
    });

    return { status: true, error: null, msg: query };
  } catch (error) {
    console.log(error);
    return { status: false, error: error.toString(), msg: "" };
  }
};

export const findCCAbyID = async (id) => {
  try {
    const query = await prisma.CCA.findUnique({
      where: {
        id: id,
      },
    });

    return { status: true, error: null, msg: query };
  } catch (error) {
    console.log(error);
    return { status: false, error: error.toString(), msg: "" };
  }
};

export const findAllCCA = async () => {
  try {
    const ccaList = await prisma.CCA.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return { status: true, error: null, msg: ccaList };
  } catch (error) {
    console.log(error);
    return { status: false, error: error.toString(), msg: "" };
  }
};

export const isLeader = async (ccaID, session) => {
  try {
    const ldr = await prisma.CCALeader.findUnique({
      where: {
        ccaID: ccaID,
        sessionEmail: session.user.email,
      },
    });

    if (ldr) {
      return { status: true, error: null, msg: true };
    } else {
      return { status: true, error: null, msg: false };
    }
  } catch (error) {
    console.log(error);
    return { status: false, error: error.toString(), msg: "" };
  }
};
