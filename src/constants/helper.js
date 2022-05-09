import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

export const getAllLocation = async () => {
    const prisma = new PrismaClient();
    const { data: session} = await getSession();

    if (session) {
        const locations = await prisma.location.findMany();
        console.log(locations);

        if (location != null) {
            return {"status": true, "error": null, "msg": locations};
        } else {
            return {"status": true, "error": null, "msg": ""};
        }
    } else {
        return {"status": false, "error": "user must be authenticated", "msg": ""};
    }
}