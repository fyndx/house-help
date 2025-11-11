import type { Context as ElysiaContext } from "elysia";
import { auth } from "@house-help/auth";
import prisma from "@house-help/db";
import type {
	Customer,
	Professional,
} from "@house-help/db/prisma/generated/client";

export type CreateContextOptions = {
	context: ElysiaContext & {
		session?: Awaited<ReturnType<typeof auth.api.getSession>> | null;
		customer?: Customer | null;
		professional?: Professional | null;
	};
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.request.headers,
	});
	context.session = session;
	const { id } = session?.user ?? {};
	if (id) {
		const data = await prisma.user.findUnique({
			where: {
				id: session?.user.id,
			},
			select: {
				customer: true,
				professional: true,
			},
		});

		context.customer = data?.customer;
		context.professional = data?.professional;
	}
	return context;
}

export type Context = Awaited<ReturnType<typeof createContext>>;
