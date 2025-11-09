import { ORPCError } from "@orpc/client";
import { protectedProcedure, publicProcedure } from "../index";
import { z } from "zod";
import prisma from "@house-help/db";
import { ServiceCategory } from "@house-help/db/prisma/generated/enums";

export const servicesRouter = {
	// CRUD for Services
	createService: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const service = await prisma.service.create({
					data: {
						name: input.name,
						description: input.description,
						slug: input.name.toLowerCase().replace(/ /g, "-"),
						baseHourlyRate: 0,
						category: ServiceCategory.OTHER,
						isActive: true,
					},
				});
				return service;
			} catch (error) {
				console.error(error);
				throw new ORPCError("CREATE_SERVICE_FAILED");
			}
		}),
	updateService: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				description: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const service = await prisma.service.update({
					where: {
						id: input.id,
					},
					data: {
						name: input.name,
						description: input.description,
					},
				});
				return service;
			} catch (error) {
				console.error(error);
				throw new ORPCError("UPDATE_SERVICE_FAILED");
			}
		}),
	deleteService: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const service = await prisma.service.delete({
					where: {
						id: input.id,
					},
				});
				return service;
			} catch (error) {
				console.error(error);
				throw new ORPCError("DELETE_SERVICE_FAILED");
			}
		}),
	getServices: publicProcedure.handler(async () => {
		try {
			// TODO: Get Services by location
			const services = await prisma.service.findMany({
				where: {
					isActive: true,
				},
			});
			return services;
		} catch (error) {
			console.error(error);
			throw new ORPCError("GET_SERVICES_FAILED");
		}
	}),
	getService: publicProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const service = await prisma.service.findUnique({
					where: {
						id: input.id,
					},
				});
				return service;
			} catch (error) {
				console.error(error);
				throw new ORPCError("GET_SERVICE_FAILED");
			}
		}),
};
