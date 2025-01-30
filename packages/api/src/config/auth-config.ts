import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, anonymous, jwt, oAuthProxy } from "better-auth/plugins";
import 'dotenv/config'
import { prisma } from "@roro-ai/database/client"

export const auth = betterAuth(
    {
        appName: "Roro",
        database: prismaAdapter(prisma, {
          provider: "postgresql",
        }),
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
          },
          github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
          },
        },
        account: {
          accountLinking: {
            enabled: true,
            trustedProviders: ["github", "google"],
          },
        },
        secret: process.env.BETTER_AUTH_SECRET,
        trustedOrigins: ['http://localhost:3000', 'http://localhost:4000'],
        plugins: [
          anonymous(), 
          oAuthProxy(), 
          admin(), 
          jwt({
            jwt: {
              issuer: process.env.NEXT_PUBLIC_APP_URL as string,
              audience: process.env.BACKEND_URL as string,
              expirationTime: "1h",
              definePayload: (data) => {
                return {
                  id: data.user.id,
                  email: data.user.email,
                  role: data.user.role
                }
              }
            } 
          }),
        ],
      }
);
