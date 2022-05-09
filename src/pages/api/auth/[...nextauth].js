import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@constants/db";

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
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        const { host } = new URL(url);
        const transport = nodemailer.createTransport(server);
        await transport.sendMail({
          to: email,
          from,
          subject: `KEVII VBS: Sign in`,
          text: text({ url, host }),
          html: html({ url, host, email }),
        });
      },
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
      return session;
    },
  },
};

function html({ url, host, email }) {
  const escapedEmail = `${email.replace(/\./g, "&#8203;.")}`;

  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#346df1";
  const buttonBorderColor = "#346df1";
  const buttonTextColor = "#ffffff";

  return `
<body style="background: ${backgroundColor};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        <strong>Login to KEVII VBS</strong>
      </td>
    </tr>
  </table>
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        Sign in as <strong>${escapedEmail}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Sign in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        If you did not request this email you can safely ignore it.
      </td>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 12px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        Contact ke7webdev@gmail.com if you have any queries.
      </td>
    </tr>
  </table>
</body>
`;
}

function text({ url, host }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
