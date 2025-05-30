import 'dotenv/config';
import { prisma, redis } from "@roro-ai/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, bearer, jwt, oAuthProxy } from "better-auth/plugins";
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
    appName: "Roro",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL!,
    user: {
        deleteUser: {
            enabled: true,
        },
    },
    advanced: {
        crossSubDomainCookies: {
            enabled: process.env.NODE_ENV === "production" ? true : false,
            domain: ".roro-ai.com",
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
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        minPasswordLength: 8,
        maxPasswordLength: 20,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url}) => {
            await resend.emails.send({
                from: process.env.RESEND_EMAIL!,
                to: user.email,
                subject: "Reset your password",
                html: `Click the link to reset your password: ${url}`,
              });
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url}) => {
            await resend.emails.send({
                from: process.env.RESEND_EMAIL!,
                to: user.email,
                subject: "Email Verification Roro AI",
                html: `Click the link to verify your email: ${url}`
              });
        }
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
            if (ttl) {
                await redis.set(key, value, ttl);
            } else {
                await redis.set(key, value);
            }
        },
        delete: async (key) => {
            await redis.del(key);
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["github", "google"],
        },
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: [
        process.env.FRONTEND_URL!,
        process.env.NEXT_PUBLIC_BACKEND_URL!,
        process.env.NEXT_PUBLIC_MEDIA_URL!
    ],
    plugins: [
        oAuthProxy(),
        admin(),
        bearer(),
        jwt({
            jwt: {
                issuer: process.env.NEXT_PUBLIC_BACKEND_URL!,
                audience: process.env.NEXT_PUBLIC_MEDIA_URL!,
                expirationTime: "1h",
            },
        }),
    ],
});

