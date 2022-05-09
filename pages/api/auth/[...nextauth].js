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

            console.log("EMAIL : " + user.email);
            console.log("VERIFICATION TOKEN : " + email.verificationRequest);
            user.yolo = true;
            
            var isAllowedToSignIn = true;

            if (email.hasOwnProperty("verificationRequest")) {
                isAllowedToSignIn = false;

                // Check for signin
                const doesUserExist = await prisma.users.findUnique({
                    where: {
                      email: user.email,
                    },
                })

                if (doesUserExist !== null) {
                    //console.log("DOES USER EXIST : " + doesUserExist);

                    isAllowedToSignIn = true;
                    user.studentID = doesUserExist.studentID;
                    user.name = doesUserExist.name;
                    user.admin = doesUserExist.admin;
                    /*
                    var index = 0;
                    for (const key in doesUserExist) {
                        if (doesUserExist.hasOwnProperty(key)) {
                            console.log(`doesUserExist Index: ${index}, ${key}: ${doesUserExist[key]}`);
                            index++;
                        }
                    }
                    */
                }
            }

            if (isAllowedToSignIn) {
                return true;
            } else {
                // Return false to display a default error message
                return false;
                // Or you can return a URL to redirect to:
                // return '/unauthorized'
            }
        },
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token from a provider.
            var index = 0;
            for (const key in session) {
                if (session.hasOwnProperty(key)) {
                    console.log(`session Index: ${index}, ${key}: ${session[key]}`);
                    index++;
                }
            }

            var index = 0;
            for (const key in session.user) {
                if (session.user.hasOwnProperty(key)) {
                    console.log(`sessionUser Index: ${index}, ${key}: ${session.user[key]}`);
                    index++;
                }
            }

            var index = 0;
            for (const key in token) {
                if (token.hasOwnProperty(key)) {
                    console.log(`token Index: ${index}, ${key}: ${token[key]}`);
                    index++;
                }
            }

            var index = 0;
            for (const key in user) {
                if (user.hasOwnProperty(key)) {
                    console.log(`user Index: ${index}, ${key}: ${user[key]}`);
                    index++;
                }
            }

            return session
        },
        async jwt({ token, account }) {
            if (account) {
                var index = 0;
                for (const key in account) {
                    if (account.hasOwnProperty(key)) {
                        console.log(`account Index: ${index}, ${key}: ${account[key]}`);
                        index++;
                    }
                }
            }
            return token
        }
      }
};