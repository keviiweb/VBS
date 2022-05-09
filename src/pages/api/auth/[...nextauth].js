import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    jwt: true,
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SIGNING_PRIVATE_KEY,
    encryption: true,
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      var isAllowedToSignIn = true;

      if (email.hasOwnProperty("verificationRequest")) {
        isAllowedToSignIn = false;

        // Check for signin
        const doesUserExist = await prisma.users.findUnique({
          where: {
            email: user.email,
          },
        });

        if (doesUserExist !== null) {
          isAllowedToSignIn = true;
        }
      }

      if (isAllowedToSignIn) {
        return true;
      } else {
        return false;
      }
    },
    async session({ session, token, user }) {
      const userFromDB = await prisma.users.findUnique({
        where: {
          email: user.email,
        },
      });

      if (userFromDB != null) {
        session.user.username = userFromDB.name;
        session.user.studentID = userFromDB.studentID;
        session.user.admin = userFromDB.admin;
      } else {
        return;
      }

      /*
            var index = 0;
            for (const key in session.user) {
                if (session.user.hasOwnProperty(key)) {
                    console.log(`sessionUser Index: ${index}, ${key}: ${session.user[key]}`);
                    index++;
                }
            }*/

      return session;
    },
  },
};
