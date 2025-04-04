import { prisma } from "@roro-ai/database/client";
import { redis } from "@roro-ai/database/client";
import 'dotenv/config'
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, anonymous, bearer, jwt, oAuthProxy } from "better-auth/plugins";

export const auth = betterAuth(
    {
        appName: "Roro",
        database: prismaAdapter(prisma, {
          provider: "postgresql",
        }),
        user: {
            deleteUser: {
              enabled: true,
            },
        },
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
        session: {
          cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 1000
          },
          storeSessionInDatabase: true,
          preserveSessionInDatabase: true,
          
        },
        secondaryStorage: {
          get: async (key) => {
            const value = await redis.get(key);
            return value ? value : null
          },
          set: async (key, value, ttl) => {
            if(ttl) await redis.set(key, value, ttl)
              else await redis.set(key, value)
          },
          delete: async (key) => {
            await redis.del(key)
          }

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
          bearer(),
          jwt({
            jwt:{
              issuer: "http://localhost:4000",
              audience: "http://localhost:5000",
              expirationTime: "1h"
            }
          }) 
        ],
    }
);
