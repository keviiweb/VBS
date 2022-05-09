import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";

import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const authHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

const options = {
    providers: [
        EmailProvider({
            server: {
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD
            }
            },
            from: process.env.EMAIL_FROM
        }),
        ],
    debug: true,
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        jwt: true,
        maxAge: 1 * 24 * 60 * 60 // 1 day
    },
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SIGNING_PRIVATE_KEY,
        encryption: true,
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {

            console.log("EMAIL : " + email.email);
            console.log("VERIFICATION TOKEN : " + email.verificationRequest)


            /*
            const isAllowedToSignIn = false
            const doesUserExist = await prisma.users.findFirst({
                where: {
                    email: credentials.email
                }
            });

            if (doesUserExist !== null) {
                isAllowedToSignIn = true
            }

            if (isAllowedToSignIn) {
                return true
            } else {
                // Return false to display a default error message
                return false
                // Or you can return a URL to redirect to:
                // return '/unauthorized'
            }*/

            return true;
        }
      }
};