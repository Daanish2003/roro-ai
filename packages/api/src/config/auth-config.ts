import 'dotenv/config';
import { prisma } from "@roro-ai/database/client";
import { Redis } from "ioredis";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, bearer, jwt, oAuthProxy } from "better-auth/plugins";
import { redis } from '@roro-ai/database/client';

export const auth = betterAuth({
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
            maxAge: 60 * 60 * 1000,
        },
        storeSessionInDatabase: true,
        preserveSessionInDatabase: true,
    },
    secondaryStorage: {
        get: async (key) => {
            const value = await redis.get(key);
            return value ? value : null;
        },
        set: async (key, value, ttl) => {
          const redis = new Redis(process.env.REDIS_URL!, {
            
          });
            if (ttl) {
                await redis.set(key, value, 'EX', ttl);
            } else {
                await redis.set(key, value);
            }
        },
        delete: async (key) => {
          const redis = new Redis(process.env.REDIS_URL!);
            await redis.del(key);
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["github", "google"],
        },
    },
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
        process.env.FRONTEND_URL!,
        process.env.NEXT_PUBLIC_BACKEND_URL!
    ],
    plugins: [
        oAuthProxy(),
        admin(),
        bearer(),
        jwt({
            jwt: {
                issuer: process.env.FRONTEND_URL,
                audience: process.env.NEXT_PUBLIC_MEDIA_URL,
                expirationTime: "1h",
            },
        }),
    ],
});
