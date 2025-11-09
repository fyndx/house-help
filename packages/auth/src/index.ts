import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@house-help/db";
import { UserRole } from "@house-help/db/prisma/generated/enums";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || "", "mybettertapp://", "exp://"],
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: UserRole.CUSTOMER,
				input: true,
				fieldName: "role",
				required: false,
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [expo(), openAPI(), inferAdditionalFields()],
});
