import { prisma } from './db';

export const getAllLocation = async (session) => {
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