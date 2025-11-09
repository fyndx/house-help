import z from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import prisma from "@house-help/db";
import { auth } from "@house-help/auth";
import { ORPCError } from "@orpc/client";
import { UserRole } from "@house-help/db/prisma/generated/enums";

export const customerRouter = {
	signUp: publicProcedure
		.input(
			z.object({
				name: z.string(),
				email: z.email(),
				password: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const signUpData = await auth.api.signUpEmail({
					body: {
						name: input.name,
						email: input.email,
						password: input.password,
						role: UserRole.CUSTOMER,
					},
				});
				if (!signUpData) {
					throw new ORPCError("SIGN_UP_FAILED");
				}
				const customer = await prisma.customer.create({
					data: {
						userId: signUpData.user.id,
					},
				});

				if (!customer) {
					throw new ORPCError("CUSTOMER_CREATION_FAILED");
				}
				return customer;
			} catch (error) {
				console.error(error);
				throw new ORPCError("Failed to create customer");
			}
		}),

	signIn: publicProcedure
		.input(
			z.object({
				email: z.string(),
				password: z.string(),
			}),
		)
		.handler(async ({ input, context, procedure }) => {
			try {
				const { headers, response: signInData } = await auth.api.signInEmail({
					body: {
						email: input.email,
						password: input.password,
					},
					returnHeaders: true,
				});
				context.set.headers = Object.fromEntries(headers.entries());
				if (!signInData) {
					throw new ORPCError("SIGN_IN_FAILED");
				}
				const customer = await prisma.customer.findUnique({
					where: {
						userId: signInData.user.id,
					},
					select: {
						id: true,
						addresses: true,
					},
				});
				if (!customer) {
					throw new ORPCError("CUSTOMER_NOT_FOUND");
				}
				// TODO: add cookies from signInData to response headers

				return {
					session: signInData,
					customer,
				};
			} catch (error) {
				console.error(error);
				throw new ORPCError("SIGN_IN_FAILED");
			}
		}),
	edit: protectedProcedure
		.input(
			z.object({
				name: z.string().optional(),
				image: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customer = await prisma.customer.update({
					where: {
						userId: context.session?.user.id,
					},
					data: {
						user: {
							update: {
								...(input.name !== undefined && { name: input.name }),
								...(input.image !== undefined && { image: input.image }),
							},
						},
					},
				});

				if (!customer) {
					throw new ORPCError("CUSTOMER_NOT_FOUND");
				}
				return customer;
			} catch (error) {
				console.error(error);
				throw new ORPCError("EDIT_CUSTOMER_FAILED");
			}
		}),
	// Addresses
	addAddress: protectedProcedure
		.input(
			z.object({
				address: z.string(),
				landmark: z.string().optional(),
				latitude: z.number(),
				longitude: z.number(),
				label: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customerId = context.customer?.id;
				if (!customerId) {
					throw new ORPCError("CUSTOMER_NOT_FOUND");
				}
				const customerAddress = await prisma.customerAddress.create({
					data: {
						address: input.address,
						landmark: input.landmark,
						latitude: input.latitude,
						longitude: input.longitude,
						label: input.label,
						customerId: customerId,
					},
				});
				// Raw prisma query to set location
				const location = `POINT(${input.longitude} ${input.latitude})`;
				// TODO: fix raw query to set location
				// await prisma.$executeRaw`UPDATE customer_address SET location = ${location} WHERE id = ${context.customer?.id}`;
				if (!customerAddress) {
					throw new ORPCError("ADDRESS_CREATION_FAILED");
				}
				return customerAddress;
			} catch (error) {
				console.error(error);
				throw new ORPCError("ADD_ADDRESS_FAILED");
			}
		}),
	getAddresses: protectedProcedure.handler(async ({ context }) => {
		try {
			const addresses = await prisma.customerAddress.findMany({
				where: {
					customerId: context.customer?.id,
				},
			});
			return addresses;
		} catch (error) {
			console.error(error);
			throw new ORPCError("GET_ADDRESSES_FAILED");
		}
	}),
	getAddress: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const address = await prisma.customerAddress.findUnique({
					where: {
						id: input.id,
					},
				});
				return address;
			} catch (error) {
				console.error(error);
				throw new ORPCError("GET_ADDRESS_FAILED");
			}
		}),
	editAddress: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				address: z.string().optional(),
				landmark: z.string().optional(),
				latitude: z.number().optional(),
				longitude: z.number().optional(),
				label: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				// Add checks for optional fields

				const address = await prisma.customerAddress.update({
					where: {
						id: input.id,
					},
					data: {
						...(input.address !== undefined && { address: input.address }),
						...(input.landmark !== undefined && { landmark: input.landmark }),
						...(input.latitude !== undefined && { latitude: input.latitude }),
						...(input.longitude !== undefined && {
							longitude: input.longitude,
						}),
						...(input.label !== undefined && { label: input.label }),
					},
				});
				// Raw prisma query to set location
				const location = `POINT(${input.longitude} ${input.latitude})`;
				if (input.latitude !== undefined && input.longitude !== undefined) {
					// TODO: fix raw query to set location
					// await prisma.$executeRaw`UPDATE customer_address SET location = ${location} WHERE id = ${input.id}`;
				}
				return address;
			} catch (error) {
				console.error(error);
				throw new ORPCError("EDIT_ADDRESS_FAILED");
			}
		}),
	deleteAddress: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const address = await prisma.customerAddress.delete({
					where: {
						id: input.id,
					},
				});

				return address;
			} catch (error) {
				console.error(error);
				throw new ORPCError("DELETE_ADDRESS_FAILED");
			}
		}),
	// Favorite Professionals
	makeProfessionalFavorite: protectedProcedure
		.input(
			z.object({
				professionalId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const customerId = context.customer?.id;
				if (!customerId) {
					throw new ORPCError("CUSTOMER_NOT_FOUND");
				}
				const favoriteProfessional = await prisma.favoriteProfessional.create({
					data: {
						customerId: customerId,
						professionalId: input.professionalId,
					},
				});
				return favoriteProfessional;
			} catch (error) {
				console.error(error);
				throw new ORPCError("ADD_FAVORITE_PROFESSIONAL_FAILED");
			}
		}),
	getFavoriteProfessionals: protectedProcedure.handler(async ({ context }) => {
		try {
			const favoriteProfessionals = await prisma.favoriteProfessional.findMany({
				where: {
					customerId: context.customer?.id,
				},
			});
			return favoriteProfessionals;
		} catch (error) {
			console.error(error);
			throw new ORPCError("GET_FAVORITE_PROFESSIONALS_FAILED");
		}
	}),
	removeProfessionalFromFavorites: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			try {
				const favoriteProfessional = await prisma.favoriteProfessional.delete({
					where: {
						id: input.id,
					},
				});
				return favoriteProfessional;
			} catch (error) {
				console.error(error);
				throw new ORPCError("DELETE_FAVORITE_PROFESSIONAL_FAILED");
			}
		}),
};
