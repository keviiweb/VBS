import { prisma } from './db';
import { getSession } from "next-auth/react";

export const getAllLocation = async () => {
    const {data: session} = await getSession();

    if (session) {
        const locations = await prisma.venue.findMany();  
        if (locations != null) {
            return {"status": true, "error": null, "msg": locations};
        } else {
            return {"status": true, "error": null, "msg": ""};
        }
    } else {
        return {"status": false, "error": "user must be authenticated", "msg": ""};
    }
}