import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";
import { Resend } from "resend";
import { EmailTemplate } from "@daveyplate/better-auth-ui/server";

const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(",") || [];
const frontendUrl = process.env.FRONTEND_URL || trustedOrigins[0];
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

      await resend.emails.send({
        from: "noreply@theharsh.xyz",
        to: user.email,
        subject: "Reset your password",
        react: EmailTemplate({
          heading: "Request For Reset your password",
          content:
            "Click the button below to reset your password. This link will expire in 1 hour.",
          action: "Reset Password",
          url: resetUrl,
          baseUrl: frontendUrl,
          siteName: "Evo",
          imageUrl: `${frontendUrl}/favicon.svg`,
        }),
      });
    },
    onPasswordReset: async ({ user }) => {
      await resend.emails.send({
        from: "noreply@theharsh.xyz",
        to: user.email,
        subject: "Password Reset Successful",
        react: EmailTemplate({
          heading: "Password Reset Successful",
          content:
            "Your password has been successfully reset. If you did not make this change, please contact support immediately.",
          baseUrl: frontendUrl,
          siteName: "Evo",
          imageUrl: `${frontendUrl}/favicon.svg`
        }),
      });
    },
  },
  user: {
    deleteUser: { enabled: true },
  },
  trustedOrigins,
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  advanced: {
    cookies: {
      session_token: {
        name: "auth_session",
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
        },
      },
    },
  },
});
