import { prisma } from "@constants/db";

export const findCCAbyName = async (name) => {
  try {
    const query = await prisma.CCA.findUnique({
      where: {
        name: name,
      },
      orderBy: {
        name: "asc"
      }
    });

    return { status: true, error: null, msg: query };
  } catch (error) {
    console.log(error);
    return { status: false, error: "Connection timeout", msg: "" };
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
    return { status: false, error: "Connection timeout", msg: "" };
  }
};

export const findAllCCA = async () => {
  try {
    const ccaList = await prisma.CCA.findMany();
    return { status: true, error: null, msg: ccaList };
  } catch (error) {
    console.log(error);
    return { status: false, error: "Connection timeout", msg: "" };
  }
};
