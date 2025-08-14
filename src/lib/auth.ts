import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { anonymous, jwt, magicLink, openAPI, twoFactor, } from "better-auth/plugins";
import { sendMagicLinkEmail } from "./email";
import { passkey } from "better-auth/plugins/passkey"


export const auth = betterAuth({
    emailAndPassword: {
        enabled: true
    },
    socialProviders:{
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        },
    },

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
     appName: "My App",
    plugins: [
        nextCookies(),
        magicLink({
            sendMagicLink: async ({ email, url }) => {
                try {
                    await sendMagicLinkEmail({ email, url });
                    console.log('✅ Magic link processed for:', email);
                } catch (error) {
                    console.error('Failed to send magic link email:', error);
                    // In development, don't throw error - the link is logged to console
                    if (process.env.NODE_ENV === 'development') {
                        console.log('🔧 Development mode: Check console for magic link');
                        return; // Don't throw error in development
                    }
                    throw new Error('Failed to send magic link email');
                }
            }
        }),
        passkey({
            rpID: process.env.NODE_ENV === 'production' 
                ? 'better-auth-murex.vercel.app'
                : 'localhost',
            rpName: 'Better Auth Demo',
            origin: process.env.NODE_ENV === 'production'
                ? 'https://better-auth-murex.vercel.app'
                : 'http://localhost:3000',
            authenticatorSelection: {
                authenticatorAttachment: undefined, // Allow both platform and cross-platform
                residentKey: 'preferred', // Encourage credential storage
                userVerification: 'preferred' // Encourage biometric verification
            }
        }),
        openAPI(),
        anonymous(),
        twoFactor(),
        jwt()
    ]
});
